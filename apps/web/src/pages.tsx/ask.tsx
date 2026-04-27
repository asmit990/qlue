import CsvUploadButton from "@/components/upload";
import Chart from "../components/charts";
import { useWebSocket } from "../hooks/useWebsocket";
import { useState } from "react";

export default function Ask() {
  const [schema, setSchema] = useState("");
  const [question, setQuestion] = useState("");
  const { ask, status, rows, chartType } = useWebSocket();

  function handleAsk() {
    if (!question.trim()) return;
  if (!schema) {
    alert("Please upload a CSV first!");
    return;
  }

    ask(question, schema);
  }

  return (
    <div className="relative min-h-screen bg-white" style={{
      backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }}>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="p-4 text-5xl font-bold text-black">Ask Qlue</h1>

        <p className="mt-2 text-center text-xl text-gray-600">
          What would you like to know about your data?
        </p>

        {schema && (
          <p className="mt-2 text-sm text-green-600">✅ Data loaded — ask away!</p>
        )}

        {/* Input */}
        <div className="mt-8 w-full max-w-2xl flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Type your question here..."
            className="w-full rounded-full border border-gray-300 px-6 py-4 text-lg shadow-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          <button
            onClick={handleAsk}
            className="bg-black text-white px-6 py-4 rounded-full text-sm hover:bg-gray-800 transition-colors"
          >
            Ask
          </button>
        </div>

        {/* Upload */}
        <div className="mt-6">
          <CsvUploadButton onUpload={(s) => setSchema(s)} />
        </div>

        {/* Status */}
        {status === "thinking" && (
          <p className="mt-8 text-sm text-gray-400 animate-pulse"> Generating SQL...</p>
        )}
        {status === "querying" && (
          <p className="mt-8 text-sm text-gray-400 animate-pulse"> Fetching data...</p>
        )}
        {status === "error" && (
          <p className="mt-8 text-sm text-red-400">Something went wrong</p>
        )}

        {/* Chart */}
        {status === "done" && rows.length > 0 && (
          <div className="mt-12 w-full max-w-3xl bg-white/80 backdrop-blur border border-gray-100 rounded-2xl p-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
              {chartType} chart · {rows.length} results
            </p>
            <Chart rows={rows} chartType={chartType as "bar" | "line" | "pie"} />
          </div>
        )}
      </div>
    </div>
  );
}