import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "./utils/mailer";
import db from "../services/database";

const JWT_SECRET = process.env.JWT_SECRET || "qlue-super-secret";



export const registerUser = async ( name:string, email: string, username: string, password: any) => {
  if (!email || !username || !password || !name) {
    throw new Error("All fields are required");
  }

  // Check if user exists
  const existingUser = db.prepare("SELECT * FROM users WHERE email = ? OR username = ?").get(email, username);
 if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const info = db.prepare("INSERT INTO users (email, username, password, name) VALUES (?, ?, ?, ?)").run(email, username, hashedPassword, name);
  
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


export const forgetPassword = async (email: string, username: string) => {


  const token = crypto.randomBytes(32).toString("hex");

  const result = db.prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE username = ?")
  .run(token, Date.now() + 3600000, username); 
  if (!result.changes) throw new Error("User not found");
  

await transporter.sendMail({
  from: `"Qlue Systems" <${process.env.EMAIL}>`,
  to: email,
  subject: "Password Reset Protocol — Qlue",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#fafafa;font-family:sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px;border-bottom:2px solid #000000;">
                  <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;color:#0a0a0a;">
                    Qlue
                  </p>
                  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af;">
                    Intelligence Systems // Access Recovery
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="margin:0 0 8px;font-size:9px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:#9ca3af;">
                    Protocol Initiated
                  </p>
                  <h1 style="margin:0 0 24px;font-size:32px;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;color:#0a0a0a;line-height:1;">
                    Password Reset<br/>Request
                  </h1>
                  <p style="margin:0 0 32px;font-size:13px;color:#6b7280;line-height:1.7;font-weight:500;">
                    A password reset request was initiated for your Qlue account. 
                    Click the button below to reset your access credentials. 
                    This link expires in <strong style="color:#0a0a0a;">1 hour</strong>.
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:#000000;">
                        <a href="http://localhost:5173/reset-password/${token}"
                          style="display:inline-block;padding:16px 40px;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                          Reset Password →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;"/>

                  <p style="margin:0 0 8px;font-size:9px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af;">
                    Or copy this link
                  </p>
                  <p style="margin:0;font-size:11px;color:#6b7280;word-break:break-all;background:#f9fafb;padding:12px;border:1px solid #e5e7eb;">
                    http://localhost:5173/reset-password/${token}
                  </p>
                </td>
              </tr>

              <!-- Warning -->
              <tr>
                <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af;">
                    Security Notice
                  </p>
                  <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;line-height:1.6;">
                    If you did not request a password reset, ignore this email. 
                    Your account remains secure. Do not share this link with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:24px 40px;border-top:2px solid #000000;display:flex;justify-content:space-between;">
                  <p style="margin:0;font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d1d5db;">
                    © 2026 Qlue Systems · Intelligence for All
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `,
});

}



export const resetPassword = async (token: string, newPassword: string) => {
const user = db.prepare(
  "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?"
).get(token, Date.now()) as any;
  if (!user) throw new Error("Invalid or expired token");

  const hashed = await bcrypt.hash(newPassword, 10);
db.prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?")
  .run(hashed, token);
};