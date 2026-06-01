import { WebSocketServer } from "ws";
import pool from "../services/database";
import { generateSQL } from "../services/gemini";
import { getChannel } from "./connection";

export const startWorker = (wss: WebSocketServer) => {
  const channel = getChannel();

  channel.consume("query_queue", async (msg) => {
    if (!msg) return;

    const { jobId, question, schema } = JSON.parse(
      msg.content.toString()
    );

    const client = [...wss.clients].find(
      (ws: any) => ws.jobId === jobId
    );

    try {
      client?.send(
        JSON.stringify({
          status: "thinking",
        })
      );

      const { sql, chartType } = await generateSQL(
        question,
        schema,
        jobId
      );

      client?.send(
        JSON.stringify({
          status: "querying",
          sql,
        })
      );

      // PostgreSQL query
      const result = await pool.query(sql);

      // Save history
      await pool.query(
        `
        INSERT INTO query_history
        (question, sql, chart_type)
        VALUES ($1, $2, $3)
      `,
        [question, sql, chartType]
      );

      client?.send(
        JSON.stringify({
          status: "done",
          rows: result.rows,
          chartType,
          sql,
        })
      );
    } catch (err: any) {
      console.error(
        "Worker error:",
        err.message
      );

      client?.send(
        JSON.stringify({
          status: "error",
          error: err.message,
        })
      );
    }

    channel.ack(msg);
  });

  console.log(
    "Worker started — listening for jobs"
  );
};