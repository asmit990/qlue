import nodemailer from "nodemailer";

if (!process.env.BREVO_PASS) {
  throw new Error("BREVO_PASS environment variable is not set");
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,        
  secure: true,     
  auth: {
    user: process.env.BREVO_USER ?? "ab7817001@smtp-brevo.com",
    pass: process.env.BREVO_PASS,
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