import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { type CSVDataset } from "./db";

let SQL: any = null;

async function getSqlJs() {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl,
  });
  return SQL;
}

// Every column is stored as TEXT, so sql.js hands numeric results back as
// strings ("10", "20.5"). Recharts needs real numbers to compute pie angles,
// axis scales, scatter/radar points, etc. — otherwise "10" + "20" concatenates
// and the chart breaks. Bars happen to tolerate numeric strings, which is why
// only the bar graph rendered before. Coerce clean numeric strings to numbers
// while leaving labels (and non-numeric text) untouched.
function coerceValue(val: any): any {
  if (typeof val !== "string" || val.trim() === "") return val;
  const num = Number(val);
  return Number.isFinite(num) ? num : val;
}

export async function executeSQLOnDataset(
  dataset: CSVDataset,
  sql: string
): Promise<Record<string, any>[]> {
  const SQLJS = await getSqlJs();
  const db: SqlJsDatabase = new SQLJS.Database();

  try {
    const columns = dataset.columns;

    const createSql = `CREATE TABLE data (${columns
      .map((c) => `"${c}" TEXT`)
      .join(", ")})`;
    db.run(createSql);

    const insertSql = `INSERT INTO data (${columns
      .map((c) => `"${c}"`)
      .join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
    const stmt = db.prepare(insertSql);

    for (const row of dataset.rows) {
      stmt.run(columns.map((c) => row[c]));
    }
    stmt.free();

    const result = db.exec(sql);
    if (result.length === 0) return [];

    const { columns: resultCols, values } = result[0];
    return values.map((row: any[]) =>
      Object.fromEntries(row.map((val, i) => [resultCols[i], coerceValue(val)]))
    );
  } finally {
    db.close();
  }
}