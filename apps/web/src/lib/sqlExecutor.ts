import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { type CSVDataset } from "./db";

let SQL: any = null;

async function getSqlJs() {
  if (SQL) return SQL;
  SQL = await initSqlJs({
  locateFile: (file: any) => `https://sql.js.org/dist/${file}`,
  });
  return SQL;
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
      Object.fromEntries(row.map((val, i) => [resultCols[i], val]))
    );
  } finally {
    db.close();
  }
}