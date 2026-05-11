import { useEffect, useRef, useState } from "react"
import { useChartStore } from "@/store/chartStore";
import type { ChartType } from "@/store/chartStore";

export function useWebSocket() {
    const ws = useRef<WebSocket | null>(null)
    const [sql, setSql] = useState("");
    const status = useChartStore((s) => s.status);
    const rows = useChartStore((s) => s.rows);
    const chartType = useChartStore((s) => s.chartType);
    
    useEffect(() => {
        function connect() {
            ws.current = new WebSocket("ws://localhost:3000");

            ws.current.onopen = () => {
                console.log("WebSocket connected");
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WS message:", data); // debug

                useChartStore.getState().setStatus(data.status);

                if (data.status === "done") {
                    console.log("rows:", data.rows); // debug
                    useChartStore.getState().setRows(data.rows);
                    useChartStore.getState().setChartType(data.chartType as ChartType);
                    setSql(data.sql);
                }
            };

            ws.current.onclose = () => {
                console.log("Disconnected — reconnecting in 2s...");
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
            useChartStore.getState().setStatus("thinking");
            ws.current.send(JSON.stringify({ question, schema }));
            return;
        }

        console.log("Waiting for WebSocket...");
        const interval = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                clearInterval(interval);
                useChartStore.getState().setStatus("thinking");
                ws.current.send(JSON.stringify({ question, schema }));
            }
        }, 100);

        setTimeout(() => clearInterval(interval), 5000);
    }

    return { ask, status, rows, chartType, sql };
}