import { useState } from "react";
import { parseAndStoreCSV } from "../lib/csvParser";
import { executeSQLOnDataset } from "../lib/sqlExecutor";
import { useQueryJob } from "../hooks/useQueryJob";
import { type CSVDataset } from "../lib/db";

export default function QueryRunner({ authToken }: { authToken: string }) {
  const [dataset, setDataset] = useState<CSVDataset | null>(null);
  const [question, setQuestion] = useState("");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [chartType, setChartType] = useState<string>("");
  const { job, runQuery } = useQueryJob();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ds = await parseAndStoreCSV(file);
    setDataset(ds);
  };

  const handleAsk = async () => {
    if (!dataset || !question) return;

    const result = await runQuery(question, dataset.schema, authToken);

    if (result.status === "ready_for_local_execution" && result.sql) {
      const resultRows = await executeSQLOnDataset(dataset, result.sql);
      setRows(resultRows);
      setChartType(result.chartType || "");
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleUpload} />
      {dataset && <p>Loaded: {dataset.name} ({dataset.rows.length} rows)</p>}

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about your data"
      />
      <button onClick={handleAsk} disabled={!dataset || !question}>
        Ask
      </button>

      <p>Status: {job.status}</p>
      {job.error && <p style={{ color: "red" }}>{job.error}</p>}

      {rows.length > 0 && (
        <pre>{JSON.stringify(rows, null, 2)}</pre>
      )}
    </div>
  );
}