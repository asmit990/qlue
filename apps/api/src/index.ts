import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import db from "./services/database";
import { generateSQL } from "./services/gemini";
import queryRouter from "./routes/query";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middlewares
app.use(express.json());
app.use(cors());

// HTTP Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Qlue API running 🚀");
});

app.use("/api", queryRouter);

// WebSocket
wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", async (message) => {
    const { question, schema } = JSON.parse(message.toString());

    try {
      ws.send(JSON.stringify({ status: "thinking" }));

      const { sql, chartType } = await generateSQL(question, schema);
      ws.send(JSON.stringify({ status: "querying", sql }));

      const rows = db.prepare(sql).all();
      ws.send(JSON.stringify({ status: "done", rows, chartType, sql }));

    } catch (err: any) {
      ws.send(JSON.stringify({ status: "error", error: err.message }));
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

// Start
server.listen(3000, () => {
  console.log("🚀 Qlue server running on port 3000");
});