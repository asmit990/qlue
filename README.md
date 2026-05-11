# Qlue — Conversational Business Intelligence

Qlue is a full-stack, AI-powered data visualization engine that transforms natural language prompts into interactive business dashboards. No SQL, no complex BI tools — just ask your data a question and get instant visual insights.

---

## The Problem

In most companies, data is locked behind technical barriers. Non-technical stakeholders wait days for data teams to write SQL queries and configure dashboards. Qlue eliminates this bottleneck by acting as an intelligent bridge between human language and databases, allowing anyone to generate a dashboard in seconds.

---

## System Architecture

```
React Frontend
      |
      | Natural language query (WebSocket)
      v
Express API  ------>  RabbitMQ Queue  ------>  Worker
                                                  |
                                          Gemini API (NL -> SQL)
                                                  |
                                              SQLite DB
                                                  |
                                          WebSocket response
                                                  |
                                         Recharts Dashboard
```

Full architecture diagram: see `qlue_system_workflow.svg`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, Recharts, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| AI Engine | Google Gemini 2.5 Flash |
| Database | SQLite (dynamic CSV-backed tables) |
| Message Broker | RabbitMQ (concurrent query handling) |
| Realtime | WebSocket (live status streaming) |
| Auth | JWT, bcrypt |
| Data Ingestion | multer, csv-parser |
| Monorepo | Turborepo, pnpm |

---

## Key Features

**Natural Language to SQL**
Advanced prompt engineering with schema context passed to Gemini to generate optimized SQLite queries. The AI understands table relationships and column semantics without any manual configuration.

**Auto-Visualization**
Gemini selects the most appropriate chart type (Bar, Line, Area, Pie, Scatter, Radar) based on the data shape and query intent — no manual chart configuration required.

**CSV Data Playground**
Upload any CSV file and the system dynamically creates SQLite tables for instant querying. Zero setup, zero schema definition.

**Concurrent Query Queue**
RabbitMQ queues all incoming user queries so multiple users are handled reliably without rate-limit crashes or request collisions.

**Live Status Streaming**
WebSocket streams real-time status updates (thinking, querying, done) back to the UI as each job progresses through the pipeline.

**Query History Sidebar**
ChatGPT-style hover sidebar tracks all previous queries grouped by date. Click any entry to re-run it instantly.

**Authentication**
Full JWT-based auth system with register, login, forgot password, and email-based password reset via nodemailer.

---

## Project Structure

```
qlue/
  apps/
    api/
      src/
        routes/           query.ts          upload + query HTTP routes
        services/         gemini.ts         AI logic + prompt engineering
                          database.ts       SQLite connection
        rabbitmq/         connection.ts     RabbitMQ setup
                          producer.ts       publish jobs to queue
                          worker.ts         consume + process jobs
                          queue.ts          queue name constants
        auth/             router.ts         auth routes
                          controller.ts     register, login, reset
                          service.ts        business logic
                          middleware.ts     JWT verification
        index.ts                            Express + WebSocket server

    web/
      src/
        components/       Chart.tsx         Recharts wrapper (6 chart types)
                          QuerySidebar.tsx  hover history sidebar
                          CsvUploadButton   file upload
                          ProtectedRoute    auth guard
        hooks/            useWebSocket.ts   WebSocket + Zustand
        store/            chartStore.ts     Zustand global state
        pages/            Landing.tsx
                          Ask.tsx
                          Dashboard.tsx
                          Register.tsx
                          Login.tsx
                          ForgetPassword.tsx
                          ResetPassword.tsx
                          AboutUs.tsx

  .env                                      environment variables
  turbo.json                                turborepo config
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- Docker (for RabbitMQ)
- Google Gemini API key — free at aistudio.google.com

### Installation

```bash
git clone https://github.com/asmit990/qlue.git
cd qlue
pnpm install
```

### Environment Setup

Create `.env` in `apps/api`:

```env
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_jwt_secret
RABBITMQ_URL=amqp://localhost
EMAIL=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
PORT=3000
```

### Start RabbitMQ

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### Run

```bash
# API
cd apps/api && pnpm dev

# Frontend
cd apps/web && pnpm dev
```

---

## How It Works

1. User uploads a CSV file — the system auto-creates a SQLite table from the file
2. User types a natural language query — sent via WebSocket to the backend
3. Query is published to RabbitMQ queue
4. Worker picks up the job, calls Gemini with the DB schema as context
5. Gemini returns SQL + recommended chart type
6. SQL runs against SQLite, rows are returned
7. WebSocket streams the result back to React
8. Recharts renders the dashboard instantly

---

## Developed by

Asmit Pandey — github.com/asmit990

