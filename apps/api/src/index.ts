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

app.get("/myip", async (req, res) => {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  res.json(data);
});
wss.on("connection", (ws: any) => {
  ws.jobId = uuid();
  console.log("Client connected:", ws.jobId);

  ws.on("message", async (message: any) => {
    const { question, schema, datasetId } = JSON.parse(message.toString());
    publishQuery(ws.jobId, question, schema, datasetId);
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