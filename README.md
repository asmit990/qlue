# Qlue — Conversational Business Intelligence

Qlue is a full-stack, AI-powered data visualization engine that transforms natural language prompts into interactive business dashboards. No SQL, no complex BI tools — just ask your data a question and get instant visual insights.

Available as a web app and, via Capacitor, as a native **Android and iOS app** running the same React codebase.

---

## The Problem

In most companies, data is locked behind technical barriers. Non-technical stakeholders wait days for data teams to write SQL queries and configure dashboards. Qlue eliminates this bottleneck by acting as an intelligent bridge between human language and databases, allowing anyone to generate a dashboard in seconds.

---




[![Watch the Demo](./thumbnail.png)](https://youtu.be/MHOpeayvVtk)


## System Architecture

```
React Frontend  ──  CSV parsed & stored in-browser (IndexedDB)
      |
      | Natural language query + schema only (WebSocket)
      v
Express API  ──────>  RabbitMQ Queue  ──────>  Worker
                                                  |
                                        Gemini API (NL -> SQL only)
                                                  |
                                     "ready_for_local_execution"
                                       { sql, chartType } over WebSocket
                                                  |
                                                  v
                                  Browser runs SQL locally (sql.js WASM)
                                                  |
                                       Recharts / Chart.js Dashboard

PostgreSQL  ──  users + query history        (raw CSV data never leaves the browser)
```

**Privacy by design:** the backend only ever sees the column schema, never the row data. Gemini generates the SQL, but the query runs entirely in the browser against the CSV you loaded — your data never touches the server.

Full architecture diagram: see ![Description](qlue_system_workflow.svg)

**Cross-platform delivery:** the same `apps/web` React build is wrapped natively via [Capacitor](https://capacitorjs.com), producing installable Android and iOS apps from a single codebase with no UI rewrite.

![Qlue running on Android](./android.png)
*Qlue's landing page rendering natively on an Android emulator (Pixel 8, API 37) via Capacitor.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), Tailwind CSS, Recharts, Chart.js, Framer Motion |
| Mobile | Capacitor (Android + iOS), wrapping the React web build natively |
| Backend | Node.js, Express 5, TypeScript |
| AI Engine | Google Gemini 2.5 Flash |
| In-browser SQL | sql.js (SQLite compiled to WASM) |
| CSV Handling | PapaParse (client-side), stored in IndexedDB |
| Database | PostgreSQL (users + query history) |
| Message Broker | RabbitMQ (concurrent query handling) |
| Realtime | WebSocket (live status streaming) |
| Auth | JWT, bcrypt, Joi validation |
| Email | Nodemailer (Gmail SMTP) |
| Monorepo | Turborepo, pnpm workspaces |

---

## Key Features

**Natural Language to SQL**
Advanced prompt engineering with schema context passed to Gemini to generate optimized SQL queries. The AI understands column semantics without any manual configuration — and only ever receives the schema, never the underlying data.

**Client-Side Query Execution**
Generated SQL runs directly in the browser via sql.js (SQLite compiled to WebAssembly). Your CSV data is parsed with PapaParse, cached in IndexedDB, and queried locally — so raw data never leaves the client.

**Auto-Visualization**
Gemini selects the most appropriate chart type (Bar, Line, Area, Pie, Scatter, Radar) based on the data shape and query intent — no manual chart configuration required.

**CSV Data Playground**
Upload any CSV file and start querying instantly. Zero setup, zero schema definition.

**Concurrent Query Queue**
RabbitMQ queues all incoming user queries so multiple users are handled reliably without rate-limit crashes or request collisions.

**Live Status Streaming**
WebSocket streams real-time status updates (`thinking`, `generated`, `ready_for_local_execution`, `error`) back to the UI as each job progresses through the pipeline.

**Query History**
Every query is persisted to PostgreSQL, grouped by date, and displayed in an inline sidebar, making it easy to rerun past questions with a single click.

**Authentication**
Full JWT-based auth system with register, login, forgot password, and email-based password reset via Nodemailer, with Joi request validation.

**Native Mobile App**
The same React web build ships as a native Android and iOS app via Capacitor — one frontend codebase, three deployment targets (web, Android, iOS), with no separate mobile rewrite.

---

## Project Structure

```
qlue/
  android/                                  Capacitor-generated native Android project
  ios/                                      Capacitor-generated native iOS project
  capacitor.config.ts                       Capacitor config (webDir -> apps/web/dist)

  apps/
    api/                                    Express + WebSocket backend
      src/
        routes/           query.ts          upload + query HTTP routes
        services/         gemini.ts         AI logic + prompt engineering
                          database.ts       Postgres schema init
        connections/      dbconnection.ts   Postgres pool
        messageBroker/    connection.ts     RabbitMQ setup
                          producer.ts       publish jobs to queue
                          worker.ts         consume + process jobs
                          queue.ts          queue name constants
        auth/             router.ts         auth routes
                          controller.ts     register, login, reset
                          service.ts        business logic
                          middleware.ts     JWT verification
                          validation/       Joi request schemas
                          utils/mailer.ts   Nodemailer (Gmail SMTP)
                          oauth/            OAuth providers (WIP)
        index.ts                            Express + WebSocket server

    web/                                    React (Vite) frontend — also the source for the mobile app
      src/
        components/       charts.tsx        chart rendering
                          queryRunner.tsx   runs generated SQL locally
                          upload.tsx        CSV upload
                          sidebar.tsx       inline query history sidebar
                          ProtectedRoute    auth guard
        lib/              sqlExecutor.ts    sql.js (WASM) query execution
                          csvParser.ts      PapaParse CSV parsing
                          db.ts             IndexedDB dataset storage
        hooks/            useWebSocket.ts   WebSocket client
        store/            chartStore.ts     Zustand global state
        pages/            landing / ask / dashboard / login /
                          register / forgetpassword / resetPassword / aboutUs

    docs/                                   Next.js documentation app

  packages/
    ui/                                     shared UI components
    eslint-config/                          shared ESLint config
    typescript-config/                      shared tsconfig presets

  turbo.json                                turborepo config
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- Docker (for RabbitMQ)
- PostgreSQL database (local or hosted)
- Google Gemini API key — free at aistudio.google.com
- For mobile builds: Android Studio (Android) and/or Xcode (iOS, macOS only)

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
DATABASE_URL=postgres://user:password@localhost:5432/qlue
RABBITMQ_URL=amqp://localhost
FRONTEND_URL=http://localhost:5173
EMAIL=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

> `EMAIL_PASSWORD` must be a Google **App Password**, not your account password.

### Start RabbitMQ

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### Run (Web)

```bash
# From the repo root (Turborepo runs all apps)
pnpm dev

# ...or run individually
cd apps/api && pnpm dev   # backend
cd apps/web && pnpm dev   # frontend
```

The Postgres tables (`users`, `query_history`) are created automatically on API startup.

### Run (Mobile — Android / iOS)

The mobile app is the `apps/web` frontend, wrapped natively via Capacitor. Build the web app first, then sync it into the native projects:

[!(./andriodtest.png)]
```bash
# Build the web frontend
cd apps/web
pnpm build

# From the repo root, sync the build into native projects
cd ../..
npx cap sync

# Open in the native IDE and run on a simulator/emulator or device
npx cap open android   # requires Android Studio
npx cap open ios       # requires Xcode (macOS only)
```

> Re-run `pnpm build` (in `apps/web`) + `npx cap sync` (from repo root) any time the frontend changes, to push the update into the native app shells.

---

## How It Works

1. User uploads a CSV — it's parsed in the browser with PapaParse and cached in IndexedDB
2. User types a natural language query — sent (with only the column schema) via WebSocket to the backend
3. The query is published to the RabbitMQ queue
4. A worker picks up the job and calls Gemini with the schema as context
5. Gemini returns SQL + a recommended chart type
6. The backend streams `ready_for_local_execution` ({ sql, chartType }) back over WebSocket and records the query in PostgreSQL
7. The browser runs the SQL locally against the loaded CSV via sql.js (WASM)
8. Recharts / Chart.js renders the dashboard instantly — raw data never left the client

This flow is identical across web, Android, and iOS — the native app shell (Capacitor) simply hosts the same frontend inside a native WebView.

---

## Developed by

Asmit Pandey — github.com/asmit990
