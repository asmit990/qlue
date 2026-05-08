import { useEffect, useRef, useState } from "react"
import { useChartStore } from "@/store/chartStore";
export function useWebSocket() {
    const ws = useRef<WebSocket | null>(null)
     const chartStore = useChartStore();
    const { setRows, setChartType, setStatus } = chartStore;
    const [sql, setSql] = useState("");
    const status = chartStore.status;
    const rows = chartStore.rows;
    const chartType = chartStore.chartType;

    useEffect(() => {
        function connect() {
            ws.current = new WebSocket("ws://localhost:3000");

            ws.current.onopen = () => {
                console.log(" WebSocket connected");
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setStatus(data.status);
                if (data.status === "done") {
                    setRows(data.rows);
                    setChartType(data.chartType);
                    setSql(data.sql);
                }
            };

            ws.current.onclose = () => {
                console.log(" Disconnected — reconnecting in 2s...");
                setTimeout(connect, 2000);
            };

            ws.current.onerror = () => {
                ws.current?.close();
            };
        }

        connect();
        return () => ws.current?.close();
    }, []);

function ask(question: string, schema: string) {
  if (ws.current?.readyState === WebSocket.OPEN) {
    setStatus("thinking");
    ws.current.send(JSON.stringify({ question, schema }));
    return;
  }

  // wait karo connection ke liye
  console.log("Waiting for WebSocket...");
  const interval = setInterval(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      clearInterval(interval);
      setStatus("thinking");
      ws.current.send(JSON.stringify({ question, schema }));
    }
  }, 100);

  // 5 seconds baad timeout
  setTimeout(() => clearInterval(interval), 5000);
    }


    return { ask, status, rows, chartType, sql }; 
}