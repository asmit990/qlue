import nodemailer from "nodemailer";

if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  throw new Error("EMAIL and EMAIL_PASSWORD environment variables must be set");
}

// Gmail SMTP: sends from any IP (no IP allowlist like Brevo's 525 5.7.1).
// EMAIL_PASSWORD must be a Google App Password, not the account password.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  rateDelta: 1000,
  rateLimit: 5,
});

// Verify connection on startup (optional but helpful for debugging)
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready");
  }
});

transporter.on("error", (err) => {
  console.error("Transporter error:", err);
});

export default transporter;