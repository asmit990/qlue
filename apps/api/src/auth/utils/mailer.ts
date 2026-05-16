import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "ab7817001@smtp-brevo.com",
    pass: process.env.BREVO_PASS,
  },
});

export default transporter;