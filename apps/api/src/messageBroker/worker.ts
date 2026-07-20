import { WebSocketServer } from "ws";
import type { Channel } from "amqplib";
import pool from "../services/database";
import { generateSQL } from "../services/gemini";
import { QUEUE_NAME } from "./connection";
import { addToHistory } from "../routes/query";

type QueryJob = {
  jobId: string;
  question: string;
  schema: string;
  datasetId?: string;
  userId: number;
};

// This is shared by the RabbitMQ consumer and the direct WebSocket fallback.
// Keeping the actual job work here means the app can still serve queries while
// the optional broker is restarting or unavailable.
export const processQueryJob = async (payload: QueryJob, wss: WebSocketServer) => {
  const { jobId, question, schema, userId } = payload;
  console.log("Worker received job:", jobId);
  const client = [...wss.clients].find((ws: any) => ws.jobId === jobId);
  if (!client) {
    console.log("Worker could not find connected client for jobId:", jobId);
  } else {
    console.log("Worker found client for jobId:", jobId, "readyState:", client.readyState);
  }

  try {
    client?.send(JSON.stringify({ status: "thinking" }));
    const { sql, chartType } = await generateSQL(question, schema, []);
    client?.send(JSON.stringify({ status: "generated", sql, chartType }));
    try {
      await pool.query(
        `
        INSERT INTO query_history
          (user_id, question, sql, chart_type)
        VALUES ($1, $2, $3, $4)
        `,
        [userId, question, sql, chartType]
      );
      addToHistory(String(userId), {
        question,
        sql,
        chartType,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr: any) {
      console.error("Failed to save query history:", dbErr.message);
    }
    client?.send(
      JSON.stringify({
        status: "ready_for_local_execution",
        sql,
        chartType,
      })
    );
  } catch (err: any) {
    console.error("Worker error:", err.message);
    client?.send(JSON.stringify({ status: "error", error: err.message }));
  }
};

export const registerWorker = async (channel: Channel, wss: WebSocketServer) => {
  const handler = async (msg: any) => {
    if (!msg) return;
    const payload = JSON.parse(msg.content.toString());
    await processQueryJob(payload, wss);
    channel.ack(msg);
  };
  try {
    await channel.consume(QUEUE_NAME, handler, {
      exclusive: true,
    });
    console.log("Worker started — listening for SQL generation jobs");
  } catch (err: any) {
    console.error("Worker could not acquire consumer, will retry:", err.message);
  }
};
