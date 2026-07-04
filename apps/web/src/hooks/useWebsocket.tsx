import { useEffect, useRef, useState } from "react"
import { useChartStore } from "@/store/chartStore";
import type { ChartType } from "@/store/chartStore";
import { getDataset } from "@/lib/db";
import  { executeSQLOnDataset} from "../lib/sqlExecutor"

export function useWebSocket() {
    const ws = useRef<WebSocket | null>(null)
    const [sql, setSql] = useState("");
    const status = useChartStore((s) => s.status);
    const rows = useChartStore((s) => s.rows);
    const chartType = useChartStore((s) => s.chartType);

    // keep the last-used datasetId around so the message handler can reach it
    const datasetIdRef = useRef<string>("");

    useEffect(() => {
        let isCleaningUp = false;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        function connect() {
            const url = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

            let socket: WebSocket;
            try {
                socket = new WebSocket(url);
            } catch (err) {
                console.error("Bad WS URL, check VITE_WS_URL:", url, err);
                reconnectTimeout = setTimeout(connect, 2000);
                return;
            }

            ws.current = socket;

            socket.onopen = () => {
                if (isCleaningUp) {
                    socket.close();
                    return;
                }
                console.log("WebSocket connected");
            };

            socket.onmessage = async (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch (err) {
                    console.error("Failed to parse WS message:", event.data, err);
                    return;
                }
                console.log("WS message:", data); // debug

                useChartStore.getState().setStatus(data.status);

                if (data.status === "generated" || data.status === "ready_for_local_execution") {
                    if (data.sql) setSql(data.sql);
                    if (data.chartType) useChartStore.getState().setChartType(data.chartType as ChartType);
                }

                if (data.status === "ready_for_local_execution") {
                    const datasetId = datasetIdRef.current;
                    if (!datasetId) {
                        console.error("No datasetId available for local execution");
                        useChartStore.getState().setStatus("error");
                        return;
                    }

                    try {
                        const dataset = await getDataset(datasetId);
                        if (!dataset) {
                            throw new Error(`Dataset ${datasetId} not found in IndexedDB`);
                        }

                        const resultRows = await executeSQLOnDataset(dataset, data.sql);

                        useChartStore.getState().setRows(resultRows);
                        useChartStore.getState().setStatus("done");

                        // Let the server know execution finished locally, in case
                        // it needs this for query history / bookkeeping. Safe to
                        // remove if the backend doesn't expect anything back here.
                        if (ws.current?.readyState === WebSocket.OPEN) {
                            ws.current.send(JSON.stringify({
                                type: "local_execution_complete",
                                rowCount: resultRows.length,
                            }));
                        }
                    } catch (err) {
                        console.error("Local SQL execution failed:", err);
                        useChartStore.getState().setStatus("error");
                    }
                }

                if (data.status === "done") {
                    // server-computed rows path (kept for backward compat, if it's ever used)
                    console.log("rows:", data.rows); // debug
                    if (data.rows) useChartStore.getState().setRows(data.rows);
                    if (data.chartType) useChartStore.getState().setChartType(data.chartType as ChartType);
                    if (data.sql) setSql(data.sql);
                }

                if (data.status === "error") {
                    console.error("Server error:", data.error);
                }
            };

            socket.onclose = () => {
                if (isCleaningUp) return;
                console.log("Disconnected — reconnecting in 2s...");
                reconnectTimeout = setTimeout(connect, 2000);
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
                socket.close();
            };
        }

        connect();

        return () => {
            isCleaningUp = true;
            clearTimeout(reconnectTimeout);
            if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
                ws.current.close();
            }
        };
    }, []);

    function ask(question: string, schema: string, datasetId: string, authToken: string) {
        datasetIdRef.current = datasetId; // remember it for ready_for_local_execution

        const send = () => {
            useChartStore.getState().setStatus("thinking");
            ws.current!.send(JSON.stringify({ question, schema, datasetId, token: authToken }));
        };

        if (ws.current?.readyState === WebSocket.OPEN) {
            send();
            return;
        }

        console.log("Waiting for WebSocket...");
        const interval = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                clearInterval(interval);
                clearTimeout(giveUp);
                send();
            }
        }, 100);

        const giveUp = setTimeout(() => {
            clearInterval(interval);
            console.error("WebSocket never connected, giving up on ask()");
            useChartStore.getState().setStatus("error");
        }, 5000);
    }

    return { ask, status, rows, chartType, sql };
}