import { WebSocketServer } from "ws";
import pool from "../services/database";
import { generateSQL } from "../services/gemini";
import { getChannel } from "./connection";
import { addToHistory } from "../routes/query";

export const startWorker = (wss: WebSocketServer) => {
  const channel = getChannel();

  channel.consume(
    "query_queue",
    async (msg) => {
    if (!msg) return;

    const { jobId, question, schema, userId } = JSON.parse(
      msg.content.toString()
    );

    console.log("Worker received job from queue:", jobId);

    const client = [...wss.clients].find((ws: any) => ws.jobId === jobId);
    
    if (!client) {
      console.log("Worker could not find connected client for jobId:", jobId);
    } else {
      console.log("Worker found client for jobId:", jobId, "readyState:", client.readyState);
    }

    try {
      console.log("Worker sending 'thinking' status to client for jobId:", jobId);
      client?.send(JSON.stringify({ status: "thinking" }));

      console.log("Worker generating SQL...");
      const { sql, chartType } = await generateSQL(question, schema, []);
      console.log("Worker SQL generated successfully");

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

        addToHistory(userId, {
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

    channel.ack(msg);
    },
    // exclusive: reject a second competing consumer instead of silently
    // round-robining jobs to a worker that can't reach the WS client.
    // Without this, a stale/duplicate server steals jobs -> no response.
    { exclusive: true }
  );

  console.log("Worker started — listening for jobs (SQL generation only)");
};