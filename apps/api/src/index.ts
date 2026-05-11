import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { v4 as uuid } from 'uuid';
import queryRouter from "./routes/query";
import authRouter from "./auth/router";
import { connectRabbitMQ } from "./messageBroker/connection";
import { startWorker } from "./messageBroker/worker";
import { publishQuery } from "./messageBroker/producer";

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

wss.on("connection", (ws: any) => {
  ws.jobId = uuid();
  console.log("Client connected:", ws.jobId);

  ws.on("message", async (message: any) => {
    const { question, schema } = JSON.parse(message.toString());
    publishQuery(ws.jobId, question, schema);
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

main().catch(console.error);