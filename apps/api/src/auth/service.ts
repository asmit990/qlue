import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "./utils/mailer";
import pool from "../services/database";

const JWT_SECRET =
  process.env.JWT_SECRET || "qlue-super-secret";

export const registerUser = async (
  name: string,
  email: string,
  username: string,
  password: string
) => {
  if (!email || !username || !password || !name) {
    throw new Error("All fields are required");
  }

  // Check existing user
  const existingUser = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1 OR username = $2
  `,
    [email, username]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const result = await pool.query(
    `
    INSERT INTO users
    (email, username, password, name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username
  `,
    [email, username, hashedPassword, name]
  );

  return result.rows[0];
};

export const loginUser = async (
  username: string,
  password: string
) => {
  if (!username || !password) {
    throw new Error(
      "Username and password are required"
    );
  }

  // Find user
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE username = $1
  `,
    [username]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // JWT
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
};

export const forgetPassword = async (
  email: string,
  username: string
) => {
  const token = crypto
    .randomBytes(32)
    .toString("hex");

  const expiry = Date.now() + 3600000;

  const result = await pool.query(
    `
    UPDATE users
    SET reset_token = $1,
        reset_token_expiry = $2
    WHERE username = $3
    RETURNING *
  `,
    [token, expiry, username]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

 await transporter.sendMail({
  from: `"Qlue Systems" <${process.env.EMAIL}>`,
  to: email,
  subject: "ACTION REQUIRED // Protocol Override — Qlue",
  html: `
    <div style="background-color: #fafafa; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
        
        <div style="border-bottom: 1px solid #e5e7eb; padding: 24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; color: #1a1a1a;">
                Qlue
              </td>
              <td align="right" style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #9ca3af;">
                Node // Auth
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 48px 32px;">
          <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: #9ca3af; margin-bottom: 24px;">
            Security Alert
          </div>
          
          <h1 style="margin: 0 0 24px 0; font-size: 40px; font-weight: 900; text-transform: uppercase; font-style: italic; line-height: 0.9; letter-spacing: -1px; color: #1a1a1a;">
            Override<br>
            <span style="-webkit-text-stroke: 1px #1a1a1a; color: white;">Protocol</span><br>
            Initiated.
          </h1>
          
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; line-height: 2; margin: 0;">
            A request was made to override the current access credentials for this node. If this was unauthorized, ignore this transmission. Otherwise, establish a new secure passphrase below.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px;">
            <tr>
              <td align="center" bgcolor="#1a1a1a" style="border: 1px solid #1a1a1a;">
                <a href="${process.env.FRONTEND_URL}/reset-password/${token}" style="display: block; padding: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #ffffff; text-decoration: none;">
                  Execute Reset Sequence &rarr;
                </a>
              </td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding: 20px 32px; background-color: #fafafa;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #10b981;">
                Uplink Stable
              </td>
              <td align="right" style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af;">
                &copy; 2026 Qlue
              </td>
            </tr>
          </table>
        </div>

      </div>
    </div>
  `,
});

  return {
    success: true,
  };
};

export const resetPassword = async (
  token: string,
  newPassword: string
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE reset_token = $1
    AND reset_token_expiry > $2
  `,
    [token, Date.now()]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error(
      "Invalid or expired token"
    );
  }

  const hashed = await bcrypt.hash(
    newPassword,
    10
  );

  await pool.query(
    `
    UPDATE users
    SET password = $1,
        reset_token = NULL,
        reset_token_expiry = NULL
    WHERE reset_token = $2
  `,
    [hashed, token]
  );

  return {
    success: true,
  };
};