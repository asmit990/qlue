import { Router, Response, Request } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import pool from "../services/database";
import { generateSQL } from "../services/gemini";
import { authenticateToken } from "../auth/middleware";

const r = Router();
const u = multer({ dest: "uploads/" });

let currentSchema = "";

r.post(
  "/upload",
  authenticateToken,
  u.single("file"),
  async (req: Request, res: Response) => {
    try {
      const results: any[] = [];

      fs.createReadStream(req.file!.path)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", async () => {
          if (results.length === 0) {
            res.status(400).json({ error: "CSV is empty" });
            return;
          }

          const columns = Object.keys(results[0]);

          const tableName = (req.file?.originalname ?? "data")
            .replace(".csv", "")
            .replace(/\s+/g, "_")
            .toLowerCase();

          if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            throw new Error("Invalid table name");
          }

          const colDefs = columns
            .map((c) => `"${c}" TEXT`)
            .join(", ");

          await pool.query(`
            CREATE TABLE IF NOT EXISTS "${tableName}" (
              ${colDefs}
            )
          `);

          for (const row of results) {
            const values = Object.values(row);

            const placeholders = values
              .map((_, i) => `$${i + 1}`)
              .join(", ");

            await pool.query(
              `
              INSERT INTO "${tableName}"
              VALUES (${placeholders})
            `,
              values
            );
          }

          currentSchema = `Tables:\n- ${tableName}(${columns.join(", ")})`;

          await pool.query(`
            CREATE TABLE IF NOT EXISTS _meta (
              key TEXT PRIMARY KEY,
              value TEXT
            )
          `);

          await pool.query(
            `
            INSERT INTO _meta(key, value)
            VALUES ($1, $2)
            ON CONFLICT (key)
            DO UPDATE SET value = EXCLUDED.value
          `,
            ["schema", currentSchema]
          );

          fs.unlinkSync(req.file!.path);

          res.json({
            success: true,
            tableName,
            columns,
            rowCount: results.length,
            schema: currentSchema,
          });
        });
    } catch (err: any) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

r.post(
  "/query",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { question, schema } = req.body;

    const activeSchema = schema || currentSchema;

    if (!activeSchema) {
      res.status(400).json({
        error: "No data uploaded yet",
      });
      return;
    }

    try {
      const { sql, chartType } = await generateSQL(
        question,
        activeSchema
      );

      const result = await pool.query(sql);

      await pool.query(
        `
        INSERT INTO query_history
        (question, sql, chart_type)
        VALUES ($1, $2, $3)
      `,
        [question, sql, chartType]
      );

      res.json({
        rows: result.rows,
        chartType,
        sql,
      });
    } catch (err: any) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

r.get(
  "/queryhistory",
  authenticateToken,
  async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT *
        FROM query_history
        ORDER BY created_at DESC
        LIMIT 20
      `);

      res.json({
        history: result.rows,
      });
    } catch (err: any) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

export default r;