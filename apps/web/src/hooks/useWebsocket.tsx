import { useEffect, useRef, useState } from "react"
import { useChartStore } from "@/store/chartStore";
import type { ChartType } from "@/store/chartStore";
import { createDataset } from "@/lib/datasets";
import { getDataset, saveDataset, type DatasetSourceType } from "@/lib/db";
import { executeSQLOnDataset, loadDatasetIntoSqlJs } from "../lib/sqlExecutor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UseWebSocketOptions {
    onDatasetImported?: (datasetId: string) => void;
}

interface QueryReadyMessage {
    status: "ready_for_local_execution";
    sql: string;
    chartType?: ChartType;
}

interface ImportReadyMessage {
    status: "ready_for_local_execution";
    datasetName?: string;
    columns: Array<{ name: string; type?: "string" | "number" } | string>;
    rows?: Record<string, unknown>[];
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const ws = useRef<WebSocket | null>(null)
    const [sql, setSql] = useState("");
    const status = useChartStore((s) => s.status);
    const rows = useChartStore((s) => s.rows);
    const chartType = useChartStore((s) => s.chartType);

    // keep the last-used datasetId around so the message handler can reach it
    const datasetIdRef = useRef<string>("");
    const connectionJobIdRef = useRef<string>("");
    const connectionWaitersRef = useRef<Array<(jobId: string) => void>>([]);
    const pendingImportSourceRef = useRef<DatasetSourceType | null>(null);

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

                if (data.type === "connected" && typeof data.jobId === "string") {
                    connectionJobIdRef.current = data.jobId;
                    for (const resolve of connectionWaitersRef.current) {
                        resolve(data.jobId);
                    }
                    connectionWaitersRef.current = [];
                    return;
                }

                useChartStore.getState().setStatus(data.status);

                if (data.status === "generated" || (data.status === "ready_for_local_execution" && data.sql)) {
                    if (data.sql) setSql(data.sql);
                    if (data.chartType) useChartStore.getState().setChartType(data.chartType as ChartType);
                }

                if (typeof data.sql === "string") {
                    const queryMessage = data as QueryReadyMessage;
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

                        const resultRows = await executeSQLOnDataset(dataset, queryMessage.sql);

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

                    return;
                }

                if (Array.isArray(data.columns)) {
                    try {
                        const importMessage = data as ImportReadyMessage;
                        const normalizedColumns = importMessage.columns.map((column) =>
                            typeof column === "string"
                                ? column
                                : {
                                    name: column.name,
                                    type: (column.type === "number" ? "number" : "string") as "number" | "string",
                                }
                        );
                        const dataset = createDataset({
                            name: importMessage.datasetName || "Imported dataset",
                            sourceType: pendingImportSourceRef.current || "google-sheets",
                            columns: normalizedColumns,
                            rows: Array.isArray(importMessage.rows) ? importMessage.rows : [],
                        });

                        await loadDatasetIntoSqlJs(dataset);
                        await saveDataset(dataset);
                        options.onDatasetImported?.(dataset.id);
                        pendingImportSourceRef.current = null;
                        useChartStore.getState().setStatus("done");
                    } catch (err) {
                        console.error("Dataset import handling failed:", err);
                        useChartStore.getState().setStatus("error");
                    }

                    return;
                }

                if (data.status === "done") {
                    // server-computed rows path (kept for backward compat, if it's ever used)
                    console.log("rows:", data.rows); // debug
                    if (data.rows) useChartStore.getState().setRows(data.rows);
                    if (data.chartType) useChartStore.getState().setChartType(data.chartType as ChartType);
                    if (data.sql) setSql(data.sql);
                }

                if (data.status === "error") {
                    pendingImportSourceRef.current = null;
                    console.error("Server error:", data.error);
                }
            };

            socket.onclose = () => {
                if (isCleaningUp) return;
                connectionJobIdRef.current = "";
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

    async function startRemoteImport(
        provider: "google" | "microsoft",
        fileId: string,
        name: string,
        authToken: string
    ) {
        pendingImportSourceRef.current =
            provider === "google" ? "google-sheets" : "excel-online";

        const jobId = await ensureConnectionJobId();
        useChartStore.getState().setStatus("thinking");

        const response = await fetch(`${API_URL}/api/connectors/import`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ provider, fileId, name, jobId }),
        });

        if (!response.ok) {
            pendingImportSourceRef.current = null;
            const error = await response.json().catch(() => null);
            throw new Error(error?.error || `Failed to queue ${provider} import`);
        }

        const payload = await response.json().catch(() => null);
        if (payload?.jobId && payload.jobId !== jobId) {
            pendingImportSourceRef.current = null;
            throw new Error("Import job was not attached to the active WebSocket connection");
        }
    }

    function ensureConnectionJobId(): Promise<string> {
        if (connectionJobIdRef.current) {
            return Promise.resolve(connectionJobIdRef.current);
        }

        return new Promise((resolve, reject) => {
            connectionWaitersRef.current.push(resolve);
            setTimeout(() => {
                const waiterIndex = connectionWaitersRef.current.indexOf(resolve);
                if (waiterIndex >= 0) {
                    connectionWaitersRef.current.splice(waiterIndex, 1);
                    reject(new Error("WebSocket connection not ready"));
                }
            }, 5000);
        });
    }

    return { ask, startRemoteImport, status, rows, chartType, sql };
}
