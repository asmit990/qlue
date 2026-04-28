import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../services/database";

const JWT_SECRET = process.env.JWT_SECRET || "qlue-super-secret";

export const registerUser = async (username: string, password: string) => {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  // Check if user exists
  const existingUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const info = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, hashedPassword);
  
  return { id: info.lastInsertRowid, username };
};

export const loginUser = async (username: string, password: string) => {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  // Find user
  const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate token
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return { token, user: { id: user.id, username: user.username } };
};
