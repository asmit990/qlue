// Dummy env vars so modules with load-time env checks (mailer, auth) can import.
process.env.BREVO_PASS ??= "test-pass";
process.env.BREVO_USER ??= "test@smtp-brevo.com";
process.env.JWT_SECRET ??= "test-secret";
process.env.FRONTEND_URL ??= "http://localhost:5173";
