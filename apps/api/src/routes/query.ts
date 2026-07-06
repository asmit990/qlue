import { Router, Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "../auth/middleware";
import { getChannel, QUEUE_NAME } from "../messageBroker/connection";
import { QueryHistoryEntry } from "../types";
import pool from "../services/database";

const r = Router();

export const queryHistoryStore = new Map<string, QueryHistoryEntry[]>();
const MAXHISTORY = 20;

export function addToHistory(userId: string, entry: QueryHistoryEntry) {
  const existing = queryHistoryStore.get(userId) || [];
  existing.unshift(entry);
  queryHistoryStore.set(userId, existing.slice(0, MAXHISTORY));
}

r.post(
  "/query",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { question, schema } = req.body;

      if (!question || !schema) {
        return res.status(400).json({
          error: "question and schema are required",
        });
      }

      const userId = (req as any).user.id;
      const jobId = uuidv4();

      const channel = getChannel();
      if (!channel) {
        return res.status(503).json({
          error: "Service temporarily unavailable, please retry",
        });
      }
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(
          JSON.stringify({ jobId, question, schema, userId })
        )
      );

      // Client uses this jobId to tag its WebSocket connection
      // (ws.jobId = jobId) so the worker can find it and stream status back.
      return res.json({ success: true, jobId });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

r.get(
  "/queryhistory",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const result = await pool.query(
        `
        SELECT question, sql, chart_type, created_at
        FROM query_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 20
        `,
        [userId]
      );

      return res.json({ history: result.rows });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

export default r;