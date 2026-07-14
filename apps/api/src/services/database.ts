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
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question TEXT,
      sql TEXT,
      chart_type TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_connections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
      access_token_enc TEXT NOT NULL,
      refresh_token_enc TEXT,
      expires_at TIMESTAMP NOT NULL,
      scope TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, provider)
    );
  `);

  console.log("DB initialized");
}

initDB().catch(console.error);

export default pool;