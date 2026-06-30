import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Chart from "../components/charts";
import { useWebSocket } from "@/hooks/useWebsocket";
import type { ChartType } from "@/store/chartStore";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sqlOpen, setSqlOpen] = useState(false);

  const schema = location.state?.schema;
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
    if (!schema || !datasetId) {
      navigate("/ask");
      return;
    }
    ask(question, schema, datasetId);
  }, []);

  return (
    <div className="h-screen w-full bg-white text-black font-sans flex flex-col overflow-hidden selection:bg-black selection:text-white">
      {/* Background Dot Grid */}
      <div
        className="fixed inset-0 opacity-[0.6] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Nav Section */}
      <nav className="relative z-20 h-20 border-b border-black bg-white flex items-center justify-between px-10">
        <div className="flex items-center gap-6">
          <span className="text-2xl font-black tracking-tighter uppercase">Qlue</span>
          <div className="h-8 w-px bg-black/10 hidden md:block" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hidden md:block">
            Dashboard // Intelligence Output
          </span>
        </div>
        <button
          onClick={() => navigate("/ask")}
          className="text-[10px] font-black uppercase tracking-[0.2em] border border-black px-6 py-2 hover:bg-black hover:text-white transition-all"
        >
          New Analysis
        </button>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Metadata */}
        <section className="w-full md:w-[28%] border-b md:border-b-0 md:border-r border-black bg-white/40 backdrop-blur-md p-10 flex flex-col justify-between overflow-y-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">Request Input</span>
            <h2 className="text-3xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8">
              "{question}"
            </h2>

            <div className="space-y-6 pt-6 border-t border-black/10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Status</span>
                <span className={`text-xs font-bold uppercase ${status === "done" ? "text-green-500" : "text-black animate-pulse"}`}>
                  {status === "done" ? "Success" : status || "Initializing"}
                </span>
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

          <div className="pt-10">
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
              Gemini AI Engine //<br />
              SQL Protocol Secure //<br />
              Result Set Verified.
            </p>
          </div>
        </section>

        {/* Right Section: The Result Box */}
        <section className="flex-1 relative flex flex-col bg-white overflow-hidden p-6 lg:p-12">
          {status === "done" && rows.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full w-full bg-white border border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden"
            >
              {/* Box Header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-black border-b-2 border-black pb-2 inline-block">
                    Visual Data Output
                  </h3>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">
                    Protocol: {chartType} // {rows.length} Nodes Detected
                  </p>
                </div>
                {/* Wired button up to data sequence */}
                <button 
                  onClick={handleExport}
                  className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 hover:invert transition-all active:scale-95"
                >
                  Extract Data
                </button>
              </div>

              {/* Box Body: Split Chart & Logic Arrow Guide */}
              <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0">
                {/* 1. The Chart Rendering Area */}
                <div className="flex-[3] relative">
                  <Chart rows={rows} chartType={chartType as ChartType} />
                </div>

                {/* 2. Logic Matrix Side-Arrow Guide */}
                <div className="flex-1 border-l border-black/5 pl-8 hidden xl:flex flex-col gap-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Logic Selection Matrix</span>
                  
                  <div className="flex flex-col gap-4">
                    {logicMatrix.map((item) => {
                      const isActive = chartType === item.type;
                      return (
                        <div 
                          key={item.type}
                          className={`flex items-center gap-4 transition-all duration-300 ${isActive ? "opacity-100 translate-x-1" : "opacity-20"}`}
                        >
                          <span className="text-lg font-black">{isActive ? "→" : "•"}</span>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-tight">{item.type}</span>
                            <span className="text-[8px] font-bold uppercase text-gray-500">{item.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto border-t border-black/10 pt-6">
                    <p className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
                      Intelligence selection based on data structure density and temporal attributes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-200">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">
                {status === "thinking" || status === "querying" ? "Establishing Data Uplink..." : "Awaiting Data Payload"}
              </span>
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-20 h-12 border-t border-black bg-white flex items-center justify-between px-10 text-[9px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-8">
          <span className="text-gray-400">Node: 127.0.0.1</span>
          <span className="text-green-500">Uplink Stable</span>
        </div>
        <div className="text-gray-400">© 2026 Qlue Systems</div>
      </footer>
    </div>
  );
}