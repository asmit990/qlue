import { Router, Response, Request } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import pool from "../services/database";
import { generateSQL } from "../services/gemini";
import { authenticateToken } from "../auth/middleware";

const r = Router();

const u = multer({ dest: "uploads/" });

// ── In-memory store for datasets (cleared on server restart) ──────────────────

interface Dataset {
  id: string;
  user_id: string;
  name: string;
  schema: string;
  rows: any[];
  created_at: string;
}

const datasetStore = new Map<string, Dataset>();
let datasetCounter = 1;

// ── Routes ────────────────────────────────────────────────────────────────────

r.post(
  "/upload",
  authenticateToken,
  u.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const results: any[] = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", () => {
          try {
            if (results.length === 0) {
              fs.unlinkSync(req.file!.path);
              return res.status(400).json({ error: "CSV is empty" });
            }

            const columns = Object.keys(results[0]);
            const datasetName = req.file?.originalname || "dataset.csv";
            const schema = `Tables:\n- data(${columns.join(", ")})\n`;
            const userId = (req as any).user.id;

            // Store dataset in memory only — never persisted to DB
            const id = String(datasetCounter++);
            datasetStore.set(id, {
              id,
              user_id: userId,
              name: datasetName,
              schema,
              rows: results,
              created_at: new Date().toISOString(),
            });

            fs.unlinkSync(req.file!.path);

            return res.json({
              success: true,
              datasetId: id,
              datasetName,
              columns,
              rowCount: results.length,
              schema,
            });
          } catch (err: any) {
            if (req.file && fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ error: err.message });
          }
        });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

r.post(
  "/query",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { question, datasetId } = req.body;

      if (!question || !datasetId) {
        return res.status(400).json({
          error: "question and datasetId are required",
        });
      }

      const userId = (req as any).user.id;

      // Look up dataset from in-memory store
      const dataset = datasetStore.get(String(datasetId));

      if (!dataset || dataset.user_id !== userId) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      const aiResponse = await generateSQL(
        question,
        dataset.schema,
        dataset.rows
      );

      // Save query history to DB, tied to the user
      await pool.query(
        `
        INSERT INTO query_history
          (user_id, question, sql, chart_type)
        VALUES ($1, $2, $3, $4)
        `,
        [
          userId,
          question,
          aiResponse.sql || "",
          aiResponse.chartType || "",
        ]
      );

      return res.json({
        success: true,
        answer: aiResponse.answer || null,
        rows: aiResponse.rows || [],
        sql: aiResponse.sql || "",
        chartType: aiResponse.chartType || "",
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

r.get(
  "/datasets",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const datasets = [...datasetStore.values()]
        .filter((d) => d.user_id === userId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .map(({ id, name, schema, created_at }) => ({
          id,
          name,
          schema,
          created_at,
        }));

      return res.json({ datasets });
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

      // Fetch only this user's query history from DB
      const result = await pool.query(
        `
        SELECT *
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

r.delete(
  "/dataset/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const rawDatasetId = req.params.id;
      const datasetId = Array.isArray(rawDatasetId)
        ? rawDatasetId[0]
        : rawDatasetId;

      const dataset = datasetStore.get(datasetId);

      if (dataset && dataset.user_id === userId) {
        datasetStore.delete(datasetId);
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

export default r;