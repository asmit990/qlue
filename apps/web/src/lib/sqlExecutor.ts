import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { type Dataset } from "./db";
import { quoteSqlIdentifier } from "./datasets";

let SQL: any = null;

async function getSqlJs() {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl,
  });
  return SQL;
}

function coerceValue(val: any): any {
  if (typeof val !== "string" || val.trim() === "") return val;
  const num = Number(val);
  return Number.isFinite(num) ? num : val;
}

export async function executeSQLOnDataset(
  dataset: Dataset,
  sql: string
): Promise<Record<string, any>[]> {
  const db = await createSqlJsDatabaseForDataset(dataset);

  try {
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

export async function loadDatasetIntoSqlJs(dataset: Dataset): Promise<void> {
  const db = await createSqlJsDatabaseForDataset(dataset);
  db.close();
}

async function createSqlJsDatabaseForDataset(dataset: Dataset): Promise<SqlJsDatabase> {
  const SQLJS = await getSqlJs();
  const db: SqlJsDatabase = new SQLJS.Database();

  const columns = dataset.columns;
  const tableName = quoteSqlIdentifier(dataset.id);

  const createSql = `CREATE TABLE ${tableName} (${columns
      .map(
        (column) =>
          `${quoteSqlIdentifier(column.name)} ${column.type === "number" ? "REAL" : "TEXT"}`
      )
      .join(", ")})`;
  db.run(createSql);

  const insertSql = `INSERT INTO ${tableName} (${columns
      .map((column) => quoteSqlIdentifier(column.name))
      .join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
  const stmt = db.prepare(insertSql);

  try {
    for (const row of dataset.rows) {
      stmt.run(columns.map((column) => row[column.name] ?? null));
    }
  } finally {
    stmt.free();
  }

  return db;
}