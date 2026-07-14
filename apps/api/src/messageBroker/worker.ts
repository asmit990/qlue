import { WebSocketServer } from "ws";
import type { Channel } from "amqplib";
import pool from "../services/database";
import { generateSQL } from "../services/gemini";
import { QUEUE_NAME } from "./connection";
import { addToHistory } from "../routes/query";
import * as XLSX from "xlsx";
import { getValidAccessToken } from "../services/tokenVault";
export const registerWorker = async (channel: Channel, wss: WebSocketServer) => {
  const handler = async (msg: any) => {
    if (!msg) return;
    const payload = JSON.parse(msg.content.toString());
    // ---- Branch: file import jobs (Sheets / Excel) — must check BEFORE destructuring query fields ----
    if (payload.type === "import_file") {
      console.log("Worker received import job:", payload.jobId);
      await handleImportFile(payload, wss);
      channel.ack(msg);
      return;
    }
    // ---- Branch: existing NL -> SQL query jobs ----
    const { jobId, question, schema, userId } = payload;
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
  };
  try {
    await channel.consume(QUEUE_NAME, handler, {
      exclusive: true,
    });
    console.log("Worker started — listening for jobs (SQL generation + file import)");
  } catch (err: any) {
    console.error("Worker could not acquire consumer, will retry:", err.message);
  }
};
// ---- File import handler (Google Sheets / Excel Online) ----
export const handleImportFile = async (
  job: { jobId: string; userId: number; provider: "google" | "microsoft"; fileId: string; name: string },
  wss: WebSocketServer
) => {
  const client = [...wss.clients].find((ws: any) => ws.jobId === job.jobId);
  if (!client) {
    console.log("Worker could not find connected client for import jobId:", job.jobId);
  }
  try {
    client?.send(JSON.stringify({ status: "thinking" }));
    const token = await getValidAccessToken(job.userId, job.provider as "google" | "microsoft");
    const url =
      job.provider === "google"
        ? `https://sheets.googleapis.com/v4/spreadsheets/${job.fileId}/values/A1:ZZ10000`
        : `https://graph.microsoft.com/v1.0/me/drive/items/${job.fileId}/content`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    let columns: any[];
    let rows: any[];
    if (job.provider === "google") {
      const { values } = await res.json();
      ({ columns, rows } = normalizeSheetValues(values));
    } else {
      const buf = await res.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      columns = inferSchema(rows);
    }
    client?.send(
      JSON.stringify({
        status: "ready_for_local_execution",
        datasetName: job.name,
        columns,
        rows,
      })
    );
  } catch (err: any) {
    console.error("Import job error:", err.message);
    client?.send(JSON.stringify({ status: "error", error: err.message }));
  }
};
// ---- Helpers ----
function normalizeSheetValues(values: any[][]): { columns: any[]; rows: any[] } {
  if (!values || values.length === 0) return { columns: [], rows: [] };
  const [header, ...body] = values;
  const rows = body.map((r) =>
    Object.fromEntries(header.map((h: string, i: number) => [h, r[i] ?? null]))
  );
  return { columns: inferSchema(rows), rows };
}
function inferSchema(rows: any[]) {
  if (!rows.length) return [];
  const sample = rows[0];
  return Object.keys(sample).map((key) => {
    const val = sample[key];
    const isNum = val !== "" && val !== null && !isNaN(parseFloat(val));
    return { name: key, type: isNum ? "number" : "string" };
  });
}