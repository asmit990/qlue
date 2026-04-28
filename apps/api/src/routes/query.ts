import { Router, Response, Request } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import db from "../services/database";
import { generateSQL } from "../services/gemini";
import { authenticateToken } from "../auth/middleware";

const r = Router()
const u = multer({dest: "uploads/"})


let currentSchema = ""

r.post("/upload", authenticateToken, u.single("file"), (req:Request, res: Response) => {
    const results: any[] = []
    
    fs.createReadStream(req.file!.path)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        if (results.length === 0) {
        res.status(400).json({ error: "CSV is empty" });
       return;
       }
        const columns = Object.keys(results[0])
        const tableName = (req.file?.originalname ?? "data")
          .replace(".csv", "")
          .replace(/\s+/g, "_")
          .toLowerCase();
       const colDefs = columns.map((c) => `"${c}" TEXT`).join(", ");
db.exec(`CREATE TABLE IF NOT EXISTS "${tableName}" (${colDefs})`); // pehle table

const placeholders = columns.map(() => "?").join(", ");
const insert = db.prepare(`INSERT INTO "${tableName}" VALUES (${placeholders})`);
results.forEach((row) => insert.run(...Object.values(row))); // phir insert
console.log("Table created:", tableName);
currentSchema = `Tables:\n- ${tableName}(${columns.join(", ")})`;
db.exec(`CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)`);
db.prepare(`INSERT OR REPLACE INTO _meta VALUES ('schema', ?)`).run(currentSchema);



       if(results.length === 0 ) { 
        console.log( " empty") 
        return}
      

        fs.unlinkSync(req.file!.path);

        res.json({ success: true, tableName, columns, rowCount: results.length, schema: currentSchema });
    
    })

})



r.post("/query" , authenticateToken, async (req: Request, res: Response) => {
  const { question , schema } = req.body;
  const activeSchema = schema || currentSchema;
  if (!activeSchema) {
  res.status(400).json({ error: "No data uploaded yet. Please upload a CSV first." });
  return;
}
  try {
    const { sql, chartType } = await generateSQL(question, activeSchema);
    const rows = db.prepare(sql).all();
    res.json({ rows, chartType, sql });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

})

export default r ;