import { Pool } from 'pg';

type Row = Record<string, unknown>;
type QueryResult = {
  rows: Row[];
  rowCount: number;
};

class QueryError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'QueryError';
  }
}

class ConnectionError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}


const pools = new Map<string, Pool>();


function poolKey(config: PostgresConfig): string {
  return `${config.host}:${config.port}:${config.database}:${config.user}`;
}

export function getPool(config: PostgresConfig): Pool {
  const key = poolKey(config);
  const existing = pools.get(key);
  if (existing) return existing;

  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  });

  pools.set(key, pool);
  return pool;
}

// Called by the "Connect" flow before credentials are ever saved —
// fails fast with a clear error instead of surfacing mid-query later.
export async function testConnection(config: PostgresConfig): Promise<void> {
  const pool = getPool(config);
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    throw new ConnectionError('postgres', 'could not connect', err);
  }
}

// Takes an already-resolved Pool, not a config — caller is expected to have
// called getPool() first. Does NOT validate the sql string; that happens
// upstream in services/sqlValidator.ts before this is ever reached.
export async function runQuery(pool: Pool, sql: string): Promise<QueryResult> {
  try {
    const result = await pool.query(sql);
    return { rows: result.rows as Row[], rowCount: result.rowCount ?? 0 };
  } catch (err) {
    throw new QueryError('postgres', 'query execution failed', err);
  }
}

export async function closePool(config: PostgresConfig): Promise<void> {
  const key = poolKey(config);
  const pool = pools.get(key);
  if (!pool) return;
  await pool.end();
  pools.delete(key);
}
