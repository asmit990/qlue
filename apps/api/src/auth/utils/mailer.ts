import nodemailer from "nodemailer";

if (!process.env.BREVO_PASS) {
  throw new Error("BREVO_PASS environment variable is not set");
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.BREVO_USER ?? "ab7817001@smtp-brevo.com", // move to env too
    pass: process.env.BREVO_PASS,
  },
  pool: true,          // reuse connections instead of creating new ones each time
  maxConnections: 5,   // Brevo free tier allows limited concurrent connections
  rateDelta: 1000,     // ms between messages
  rateLimit: 5,        // max messages per rateDelta window
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