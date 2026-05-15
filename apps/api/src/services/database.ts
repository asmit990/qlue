import { pool } from "../connections/dbconnection";

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      email TEXT UNIQUE,
      reset_token TEXT,
      reset_token_expiry BIGINT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS query_history (
      id SERIAL PRIMARY KEY,
      question TEXT,
      sql TEXT,
      chart_type TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("DB initialized");
}

initDB().catch(console.error);

export default pool;