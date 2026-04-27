import { useEffect, useRef, useState } from "react"

export function useWebSocket() {
    const ws = useRef<WebSocket | null>(null)
    const [status, setStatus] = useState<"idle" | "thinking" | "querying" | "done" | "error">("idle");
    const [rows, setRows] = useState<any[]>([]);
    const [chartType, setChartType] = useState("bar");
    const [sql, setSql] = useState("");

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
        if (ws.current?.readyState !== WebSocket.OPEN) {
            console.log("WebSocket not open, readyState:", ws.current?.readyState);
            return;
        }
        setStatus("thinking");
        ws.current.send(JSON.stringify({ question, schema }));
    }

    return { ask, status, rows, chartType, sql };
}