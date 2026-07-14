// services/tokenVault.ts
import crypto from "crypto";
import { pool } from "../connections/dbconnection";
import { googleProvider } from "../auth/provider/google";
// import { microsoftProvider } from "../auth/oauth/provider/microsoft"; // add once built
import { microsoftProvider } from "../auth/provider/microsoft";

const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, "hex"); // 32 bytes hex

function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

function getProvider(provider: "google" | "microsoft") {
  if (provider === "google") return googleProvider;
   if (provider === "microsoft") return microsoftProvider;
  throw new Error(`Unknown provider: ${provider}`);
}

export async function saveConnection(
  userId: number,
  provider: "google" | "microsoft",
  tokens: { access_token: string; refresh_token?: string; expires_at: Date; scope?: string }
) {
  await pool.query(
    `INSERT INTO user_connections (user_id, provider, access_token_enc, refresh_token_enc, expires_at, scope, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id, provider)
     DO UPDATE SET
       access_token_enc = EXCLUDED.access_token_enc,
       refresh_token_enc = COALESCE(EXCLUDED.refresh_token_enc, user_connections.refresh_token_enc),
       expires_at = EXCLUDED.expires_at,
       scope = EXCLUDED.scope,
       updated_at = NOW()`,
    [
      userId,
      provider,
      encrypt(tokens.access_token),
      tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      tokens.expires_at,
      tokens.scope ?? null,
    ]
  );
}

export async function getValidAccessToken(userId: number, provider: "google" | "microsoft"): Promise<string> {
  const { rows } = await pool.query(
    `SELECT access_token_enc, refresh_token_enc, expires_at
     FROM user_connections WHERE user_id = $1 AND provider = $2`,
    [userId, provider]
  );
  if (!rows[0]) throw new Error("not_connected");

  const { access_token_enc, refresh_token_enc, expires_at } = rows[0];

  // still valid (1 min buffer)
  if (new Date(expires_at).getTime() > Date.now() + 60_000) {
    return decrypt(access_token_enc);
  }

  if (!refresh_token_enc) throw new Error("no_refresh_token");

  const providerImpl = getProvider(provider);
  const refreshed = await providerImpl.refreshToken(decrypt(refresh_token_enc));

  await pool.query(
    `UPDATE user_connections SET access_token_enc = $1, expires_at = $2, updated_at = NOW()
     WHERE user_id = $3 AND provider = $4`,
    [encrypt(refreshed.access_token), refreshed.expires_at, userId, provider]
  );

  return refreshed.access_token;
}