import "dotenv/config";
import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { v4 as uuid } from 'uuid';
import queryRouter from "./routes/query";
import authRouter from "./auth/router";
import { startRabbitMQ, closeRabbitMQ } from "./messageBroker/connection";
import { registerWorker } from "./messageBroker/worker";
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
    const { type, question, schema, datasetId, token } = JSON.parse(message.toString());

    // Client sends bookkeeping messages (e.g. after finishing local SQL
    // execution) that are not new queries and carry no auth token. Ignore
    // them here instead of running them through jwt.verify, which would fail
    // and spuriously reply "Unauthorized".
    if (type && type !== "query") {
      console.log("Ignoring non-query WS message of type:", type);
      return;
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (err) {
      ws.send(JSON.stringify({ status: "error", error: "Unauthorized" }));
      return;
    }

    console.log("Token verified. User ID:", userId);
    const published = publishQuery(ws.jobId, question, schema, datasetId, userId);
    if (!published) {
      ws.send(
        JSON.stringify({
          status: "error",
          error: "Service temporarily unavailable, please retry",
        })
      );
      return;
    }
    console.log("Query published for jobId:", ws.jobId);
  });

  ws.on("close", () => console.log("Client disconnected:", ws.jobId));
});

async function main() {
  // Bind the port immediately so the platform (Render) detects an open port
  // and the service stays healthy even while RabbitMQ is (re)connecting. The
  // broker supervisor connects in the background and re-registers the worker
  // on every (re)connect, so a transient AMQP failure never takes the HTTP
  // server down.
  const port = Number(process.env.PORT) || 3000;
  server.listen(port, () => {
    console.log(`Qlue server running on port ${port}`);
  });

  startRabbitMQ((channel) => registerWorker(channel, wss));
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