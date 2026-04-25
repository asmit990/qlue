export default function AboutUs() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="about-wrapper">
        <p className="about-eyebrow">About Qlue</p>

        <h1 className="about-headline">
          Data insights shouldn't require a
          <br />
          <em>data scientist.</em>
        </h1>

        <p className="about-subtext">
          Qlue turns plain English into interactive dashboards —
          instantly. Ask a question, get a chart. No SQL. No setup.
          No waiting.
        </p>

        <div className="about-divider" />

        <div className="about-cards">
          <div className="about-card">
            <div className="about-card-number">01</div>
            <div className="about-card-title">
              Natural language first
            </div>
            <div className="about-card-text">
              Type what you want to know — Qlue figures out the rest.
              No query language, no configuration.
            </div>
          </div>

          <div className="about-card">
            <div className="about-card-number">02</div>
            <div className="about-card-title">
              AI-powered SQL engine
            </div>
            <div className="about-card-text">
              Gemini reads your data schema and writes precise
              queries so the charts are always accurate.
            </div>
          </div>

          <div className="about-card">
            <div className="about-card-number">03</div>
            <div className="about-card-title">
              Bring your own data
            </div>
            <div className="about-card-text">
              Upload any CSV and start asking questions immediately.
              No formatting, no migration.
            </div>
          </div>
        </div>

        <div className="about-mission">
          <div className="about-mission-label">Mission</div>
          <p className="about-mission-text">
            We built Qlue because the gap between having data and
            understanding it is too wide — and it shouldn't be.
          </p>
        </div>

        <div className="about-built-by">
          <span className="about-built-label">Built by</span>
          <span className="about-built-name">Asmit Pandey</span>
          <span className="about-built-role">
            Full-stack developer · 2025
          </span>
        </div>
      </div>
    </div>
  );
}