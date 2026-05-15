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
    subject: "Password Reset Protocol — Qlue",

    html: `
      <h1>Password Reset</h1>

      <p>
        Click below to reset your password:
      </p>

      <a href="${process.env.FRONTEND_URL}/reset-password/${token}">
        Reset Password
      </a>
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