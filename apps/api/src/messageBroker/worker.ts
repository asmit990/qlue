import { WebSocketServer } from "ws";
import pool from "../services/database";
import { generateSQL } from "../services/gemini";
import { getChannel } from "./connection";
import { addToHistory } from "../routes/query";

export const startWorker = (wss: WebSocketServer) => {
  const channel = getChannel();

  channel.consume("query_queue", async (msg) => {
    if (!msg) return;

    const { jobId, question, schema, userId } = JSON.parse(
      msg.content.toString()
    );

    const client = [...wss.clients].find((ws: any) => ws.jobId === jobId);

    try {
      client?.send(JSON.stringify({ status: "thinking" }));

      // Server never receives CSV rows — only schema (column names) and the question.
      const { sql, chartType } = await generateSQL(question, schema, []);

      client?.send(JSON.stringify({ status: "generated", sql, chartType }));

      // Save only question/SQL/chart metadata — never CSV content.
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

      // Client now executes this SQL locally against IndexedDB-stored rows via sql.js.
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
  });

  console.log("Worker started — listening for jobs (SQL generation only)");
};