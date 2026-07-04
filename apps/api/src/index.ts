import "dotenv/config";
import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { v4 as uuid } from 'uuid';
import queryRouter from "./routes/query";
import authRouter from "./auth/router";
import { connectRabbitMQ, closeRabbitMQ } from "./messageBroker/connection";
import { startWorker } from "./messageBroker/worker";
import { publishQuery } from "./messageBroker/producer";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "qlue-super-secret";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.send("Qlue API running");
});

app.use("/api/auth", authRouter);

app.use("/api", queryRouter);

app.get("/myip", async (req, res) => {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  res.json(data);
});

wss.on("connection", (ws: any) => {
  ws.jobId = uuid();
  console.log("Client connected:", ws.jobId);

  ws.on("message", async (message: any) => {
    console.log("Received message on WS for jobId:", ws.jobId);
    const { question, schema, datasetId, token } = JSON.parse(message.toString());

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (err) {
      ws.send(JSON.stringify({ status: "error", error: "Unauthorized" }));
      return;
    }

    console.log("Token verified. User ID:", userId);
    publishQuery(ws.jobId, question, schema, datasetId, userId);
    console.log("Query published for jobId:", ws.jobId);
  });

  ws.on("close", () => console.log("Client disconnected:", ws.jobId));
});

async function main() {
  await connectRabbitMQ();
  startWorker(wss);
  server.listen(3000, () => {
    console.log("Qlue server running on port 3000");
  });
}

// Release the RabbitMQ consumer on exit/reload so we don't leave orphaned
// consumers competing on the shared queue (which silently steal jobs).
let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}, shutting down gracefully...`);
  await closeRabbitMQ();
  server.close(() => process.exit(0));
  // Force-exit if server.close hangs on open connections.
  setTimeout(() => process.exit(0), 3000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch(console.error);