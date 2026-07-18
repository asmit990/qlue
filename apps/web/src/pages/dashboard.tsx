import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Chart from "../components/charts";
import { useWebSocket } from "@/hooks/useWebsocket";
import type { ChartType } from "@/store/chartStore";
import { motion } from "framer-motion";
import { getDataset } from "@/lib/db";

import SharingButton from "@/components/ui/sharingButton";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sqlOpen, setSqlOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [datasetTableName, setDatasetTableName] = useState("");

  const datasetId = location.state?.datasetId;
  const question = location.state?.question || "Show insights";

  const { ask, status, rows, chartType, sql } = useWebSocket();

  const logicMatrix = [
    { type: "bar", label: "Comparisons & Rankings" },
    { type: "line", label: "Trends Over Time" },
    { type: "area", label: "Cumulative Trends" },
    { type: "pie", label: "Parts of a Whole" },
    { type: "scatter", label: "Correlation" },
    { type: "radar", label: "Multi-Dimension" },
  ];

  const handleExport = () => {
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    
    const csvRows = [
      headers.join(","), 
      ...rows.map(row => 
        headers.map(header => {
          const val = row[header];
          return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `qlue_matrix_${chartType}_${timestamp}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!datasetId) {
      navigate("/ask");
      return;
    }

    let isMounted = true;

    void (async () => {
      const dataset = await getDataset(datasetId);

      if (!dataset) {
        navigate("/ask");
        return;
      }

      if (!isMounted) {
        return;
      }

      setDatasetName(dataset.name);
      setDatasetTableName(dataset.id);

      const token = localStorage.getItem("token") || "";
      ask(question, dataset.schema, dataset.id, token);
    })();

    return () => {
      isMounted = false;
    };
  }, []); 

  return (
    // CHANGED: min-h-[100dvh] instead of h-screen for mobile address bar handling
    // Removed strict overflow-hidden so mobile can scroll naturally
    <div className="min-h-[100dvh] w-full bg-white text-black font-sans flex flex-col overflow-x-hidden selection:bg-black selection:text-white">
      {/* Background Dot Grid */}
      <div
        className="fixed inset-0 opacity-[0.6] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Nav Section */}
      <nav className="relative z-20 border-b border-black bg-white flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-10 md:h-20 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Qlue</span>
          <div className="h-6 w-px bg-black/10 hidden md:block" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hidden md:block">
            Dashboard // Intelligence Output
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => navigate("/ask")}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-black px-4 py-2 hover:bg-black hover:text-white transition-all whitespace-nowrap"
          >
            New Analysis
          </button>
          
          <SharingButton
            question={question}
            chartType={chartType ?? "bar"}
            chartData={rows ?? []}
          />
        </div>
      </nav>

      {/* CHANGED: Removed fixed height forcing. Let it stack on mobile (flex-col) and row on desktop (md:flex-row) */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar: Metadata */}
        <section className="w-full md:w-[28%] lg:w-[25%] border-b md:border-b-0 md:border-r border-black bg-white/80 backdrop-blur-md p-6 md:p-10 flex flex-col justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">Request Input</span>
            <h2 className="text-2xl md:text-3xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8 break-words">
              "{question}"
            </h2>

            <div className="space-y-4 md:space-y-6 pt-6 border-t border-black/10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Status</span>
                <span className={`text-xs font-bold uppercase ${status === "done" ? "text-green-500" : "text-black animate-pulse"}`}>
                  {status === "done" ? "Success" : status || "Initializing"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Dataset</span>
                <span className="text-xs font-bold uppercase">{datasetName || "Loading"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">SQL Table</span>
                <span className="break-all text-[10px] font-bold">{datasetTableName || "Pending"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Matrix Type</span>
                <span className="text-xs font-bold uppercase">{chartType || "Pending"}</span>
              </div>
            </div>

            {/* SQL Toggle */}
            {sql && (
              <div className="mt-8 border-t border-black/10 pt-6">
                <button
                  onClick={() => setSqlOpen(!sqlOpen)}
                  className="w-full flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
                >
                  <span>Generated SQL</span>
                  <span>{sqlOpen ? "▲" : "▼"}</span>
                </button>
                {sqlOpen && (
                  <motion.pre
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 text-[9px] font-mono bg-gray-50 border border-gray-200 p-4 overflow-x-auto text-gray-600 leading-relaxed"
                  >
                    {sql}
                  </motion.pre>
                )}
              </div>
            )}
          </motion.div>

          {/* Hidden on very small screens to save space */}
          <div className="pt-10 hidden sm:block">
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
              Gemini AI Engine //<br />
              SQL Protocol Secure //<br />
              Result Set Verified.
            </p>
          </div>
        </section>

        {/* Right Section: The Result Box */}
        <section className="flex-1 relative flex flex-col bg-white p-4 md:p-6 lg:p-12 min-h-[500px] md:min-h-0">
          {status === "done" && rows?.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full w-full bg-white border border-black p-4 sm:p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative"
            >
              {/* Box Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
                <div>
                  <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-black border-b-2 border-black pb-2 inline-block">
                    Visual Data Output
                  </h3>
                  <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">
                    Protocol: {chartType} // {rows.length} Nodes Detected
                  </p>
                </div>
                <button 
                  onClick={handleExport}
                  className="w-full sm:w-auto text-[9px] font-black uppercase tracking-widest bg-black text-white px-4 py-3 sm:py-2 hover:invert transition-all active:scale-95"
                >
                  Extract Data
                </button>
              </div>

              {/* Box Body: Split Chart & Logic Arrow Guide */}
              <div className="flex-1 flex flex-col lg:flex-row gap-10">
                {/* 1. The Chart Rendering Area - Added min-h to prevent collapsing on mobile */}
                <div className="flex-[3] relative min-h-[350px] sm:min-h-[400px] w-full">
                  <Chart rows={rows} chartType={chartType as ChartType} />
                </div>

                {/* 2. Logic Matrix Side-Arrow Guide */}
                <div className="flex-1 border-t lg:border-t-0 lg:border-l border-black/10 pt-8 lg:pt-0 lg:pl-8 hidden md:flex flex-col gap-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Logic Selection Matrix</span>
                  
                  <div className="flex flex-row lg:flex-col gap-4 flex-wrap">
                    {logicMatrix.map((item) => {
                      const isActive = chartType === item.type;
                      return (
                        <div 
                          key={item.type}
                          className={`flex items-center gap-2 lg:gap-4 transition-all duration-300 w-[45%] lg:w-full ${isActive ? "opacity-100 lg:translate-x-1" : "opacity-20"}`}
                        >
                          <span className="text-lg font-black">{isActive ? "→" : "•"}</span>
                          <div className="flex flex-col">
                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-tight">{item.type}</span>
                            <span className="text-[7px] lg:text-[8px] font-bold uppercase text-gray-500 hidden lg:block">{item.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto border-t border-black/10 pt-6 hidden lg:block">
                    <p className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
                      Intelligence selection based on data structure density and temporal attributes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] w-full flex items-center justify-center border border-dashed border-gray-300 bg-gray-50/50">
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse text-center px-4">
                {status === "thinking" || status === "querying" ? "Establishing Data Uplink..." : "Awaiting Data Payload"}
              </span>
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-20 border-t border-black bg-white flex flex-col sm:flex-row items-center justify-between p-4 md:px-10 md:h-12 gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-4 md:gap-8">
          <span className="text-gray-400">Node: Local</span>
          <span className="text-green-500">Uplink Stable</span>
        </div>
        <div className="text-gray-400">© 2026 Qlue Systems</div>
      </footer>
    </div>
  );
}
// Removed the fixed height on the main section to allow for natural stacking on mobile and row layout on desktop. Added min-h to chart area to prevent collapsing on mobile.
