import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { registerUser, loginUser, forgetPassword, resetPassword } from "../src/auth/service";
import db from "../src/services/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../src/services/database", () => {
  const prepareMock = jest.fn();
  return { prepare: prepareMock, exec: jest.fn() };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: (jest.fn() as jest.Mock).mockResolvedValue({ messageId: "test-id" }),
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a chainable better-sqlite3 statement stub */
const makeStmt = (getResult: any = null, runResult: any = { lastInsertRowid: 1 }) => ({
  get: jest.fn().mockReturnValue(getResult),
  run: jest.fn().mockReturnValue(runResult),
});

const mockPrepare = db.prepare as jest.Mock;

// ─── registerUser ─────────────────────────────────────────────────────────────

describe("registerUser", () => {
  beforeEach(() => {jest.clearAllMocks()});

  it("throws if any required field is missing", async () => {
    await expect(registerUser("", "alice", "pass")).rejects.toThrow(
      "Email, username, and password are required"
    );
    await expect(registerUser("a@b.com", "", "pass")).rejects.toThrow(
      "Email, username, and password are required"
    );
    await expect(registerUser("a@b.com", "alice", "")).rejects.toThrow(
      "Email, username, and password are required"
    );
  });

  it("throws if username already exists", async () => {
    const stmt = makeStmt({ id: 1, username: "alice" });
    mockPrepare.mockReturnValue(stmt);

    await expect(registerUser("a@b.com", "alice", "pass")).rejects.toThrow(
      "User already exists"
    );
  });

  it("inserts a new user and returns id + username", async () => {
    const selectStmt = makeStmt(null);
    const insertStmt = makeStmt(null, { lastInsertRowid: 42 });

    mockPrepare
      .mockReturnValueOnce(selectStmt)  // SELECT
      .mockReturnValueOnce(insertStmt); // INSERT

    (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue("hashed_password");
    (jwt.sign as jest.Mock).mockReturnValue("mock.jwt.token");

    const result = await registerUser("a@b.com", "alice", "secret");

    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(insertStmt.run).toHaveBeenCalledWith("a@b.com", "alice", "hashed_password");
    expect(result).toEqual({ id: 42, username: "alice" });
  });
});

// ─── loginUser ────────────────────────────────────────────────────────────────

describe("loginUser", () => {
  beforeEach(async () => jest.clearAllMocks());

  it("throws if username or password is missing", async () => {
    await expect(loginUser("", "pass")).rejects.toThrow(
      "Username and password are required"
    );
    await expect(loginUser("alice", "")).rejects.toThrow(
      "Username and password are required"
    );
  });

  it("throws if user is not found", async () => {
    mockPrepare.mockReturnValue(makeStmt(null));

    await expect(loginUser("alice", "pass")).rejects.toThrow("Invalid credentials");
  });

  it("throws if password does not match", async () => {
    mockPrepare.mockReturnValue(
      makeStmt({ id: 1, username: "alice", password: "hashed" })
    );
    (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(false);

    await expect(loginUser("alice", "wrongpass")).rejects.toThrow("Invalid credentials");
  });

  it("returns a token and user object on success", async () => {
    mockPrepare.mockReturnValue(
      makeStmt({ id: 1, username: "alice", password: "hashed" })
    );
    (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mock.jwt.token");

    const result = await loginUser("alice", "correctpass");

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, username: "alice" },
      expect.any(String),
      { expiresIn: "1d" }
    );
    expect(result).toEqual({
      token: "mock.jwt.token",
      user: { id: 1, username: "alice" },
    });
  });
});

// ─── forgetPassword ───────────────────────────────────────────────────────────

describe("forgetPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws if user is not found", async () => {
    mockPrepare.mockReturnValue(makeStmt(null));

    await expect(forgetPassword("a@b.com", "ghost")).rejects.toThrow("User not found");
  });

  it("updates reset token in db and sends email on success", async () => {
    const selectStmt = makeStmt({ id: 1, username: "alice" });
    const updateStmt = makeStmt();

    mockPrepare
      .mockReturnValueOnce(selectStmt)  // SELECT
      .mockReturnValueOnce(updateStmt); // UPDATE

    const sendMail = nodemailer.createTransport({} as any).sendMail as jest.Mock;

    await forgetPassword("alice@example.com", "alice");

    expect(updateStmt.run).toHaveBeenCalledWith(
      expect.any(String),   // reset token (hex string)
      expect.any(Number),   // expiry timestamp
      "alice"
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alice@example.com",
        subject: "Password Reset",
      })
    );
  });
});

// ─── resetPassword ────────────────────────────────────────────────────────────

describe("resetPassword", () => {
  beforeEach(async () => await jest.clearAllMocks());

  it("throws if token is invalid or expired", async () => {
    mockPrepare.mockReturnValue(makeStmt(null));

    await expect(resetPassword("badtoken", "newpass")).rejects.toThrow(
      "Invalid or expired token"
    );
  });

  it("hashes new password and clears reset token on success", async () => {
    const selectStmt = makeStmt({ id: 1, username: "alice", reset_token: "validtoken" });
    const updateStmt = makeStmt();

    mockPrepare
      .mockReturnValueOnce(selectStmt)  // SELECT with token + expiry check
      .mockReturnValueOnce(updateStmt); // UPDATE password

    (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue("new_hashed_password");

    await resetPassword("validtoken", "mynewpassword");

    expect(bcrypt.hash).toHaveBeenCalledWith("mynewpassword", 10);
    expect(updateStmt.run).toHaveBeenCalledWith("new_hashed_password", "validtoken");
  });
});