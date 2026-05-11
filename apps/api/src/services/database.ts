import Database from "better-sqlite3";
const db = new Database("qlue.db");


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    email TEXT UNIQUE,
    reset_token TEXT,
    reset_token_expiry INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS query_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    sql TEXT,
    chart_type TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
export default db;