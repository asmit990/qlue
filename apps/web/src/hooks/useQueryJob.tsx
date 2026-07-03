import { useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

type JobStatus =
  | "idle"
  | "thinking"
  | "generated"
  | "ready_for_local_execution"
  | "error";

interface JobResult {
  status: JobStatus;
  sql?: string;
  chartType?: string;
  error?: string;
}

const WS_URL = "wss://your-api-domain.com/ws"; 

export function useQueryJob() {
  const [job, setJob] = useState<JobResult>({ status: "idle" });
  const wsRef = useRef<WebSocket | null>(null);

  const runQuery = useCallback(
    async (
      question: string,
      schema: string,
      authToken: string
    ): Promise<JobResult> => {
      return new Promise(async (resolve) => {
        setJob({ status: "thinking" });

        // 1. POST to /query to enqueue the job and get a jobId
        const res = await fetch("/api/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ question, schema }),
        });
        const { jobId } = await res.json();

        // 2. Open a WebSocket and tag it with this jobId
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ jobId }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setJob(data);

          if (
            data.status === "ready_for_local_execution" ||
            data.status === "error"
          ) {
            resolve(data);
            ws.close();
          }
        };

        ws.onerror = () => {
          const errResult: JobResult = {
            status: "error",
            error: "WebSocket connection failed",
          };
          setJob(errResult);
          resolve(errResult);
        };
      });
    },
    []
  );

  return { job, runQuery };
}