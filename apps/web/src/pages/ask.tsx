import CsvUploadButton from "@/components/upload";
import Chart from "../components/charts";
import { useWebSocket } from "../hooks/useWebsocket";
import { useState } from "react";
import QuerySidebar from "@/components/sidebar";

/**
 * Qlue Core Interface - Editorial Grid Edition
 * Aesthetic: Brutalist Data Terminal
 */
export default function Ask() {
  const [schema, setSchema] = useState("");
  const [question, setQuestion] = useState("");
  const { ask, status, rows, chartType } = useWebSocket();

  function handleAsk() {
    if (!question.trim()) return;
    if (!schema) {
      alert("SYSTEM HALT: Please upload a CSV schema first.");
      return;
    }
    ask(question, schema);
  }

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white">
      {/* 1. Diamond-Dot Canvas Background */}
      <div 
        className="fixed inset-0 opacity-[0.6] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`, 
          backgroundSize: '32px 32px' 
        }}
      ></div>

      {/* 2. Top Navigation / Status Bar */}
      <nav className="relative z-20 h-16 border-b border-black bg-white flex items-center justify-between px-6 md:px-12 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex items-center gap-4">
          <span className="text-xl tracking-tighter">Qlue</span>
          <span className="text-gray-300 hidden md:inline">///</span>
          <span className="text-gray-400 hidden md:inline">Workspace</span>
        </div>
        <div className="flex items-center gap-6">
          {schema ? (
            <span className="text-green-500">Schema Active</span>
          ) : (
            <span className="text-red-500 animate-pulse">Awaiting Schema</span>
          )}
          <a href="/" className="hover:text-gray-500 transition-colors">Exit</a>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row">
        
        {/* 3. Left Sidebar (Query History/Prompts) */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-black bg-white/80 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b border-black">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Query Injectors
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Note: Ensure QuerySidebar component uses transparent/flat styles internally */}
            <QuerySidebar
              onSelect={(item: any) => {
                setQuestion(item.question);
                ask(item.question, schema);
              }}
            />
          </div>
        </aside>

        {/* 4. Main Terminal Area */}
        <section className="flex-1 flex flex-col bg-transparent">
          
          {/* Header & Data Entry Segment */}
          <div className="bg-white border-b border-black flex flex-col">
            {/* Input Row */}
            <div className="p-6 md:p-12 flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                Command Line // Input Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="ENTER QUERY HERE..."
                className="w-full bg-transparent text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-black placeholder:text-gray-200 focus:outline-none"
              />
            </div>

            {/* Action Bar Split */}
            <div className="flex flex-col sm:flex-row border-t border-black">
              {/* Upload Cell */}
              <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-black flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Data Source</span>
                <CsvUploadButton onUpload={(s) => setSchema(s)} />
              </div>
              {/* Execute Cell */}
              <button
                onClick={handleAsk}
                className="flex-[0.5] p-6 bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center group"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Execute</span>
                <span className="ml-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
              </button>
            </div>
          </div>

          {/* System Status Banner */}
          {(status === "thinking" || status === "querying" || status === "error") && (
            <div className={`border-b border-black p-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 ${
              status === "error" ? "bg-red-50 text-red-500" : "bg-black text-white"
            }`}>
              <span className="animate-pulse">
                {status === "thinking" && "System Status: Generating SQL Payload..."}
                {status === "querying" && "System Status: Accessing Database..."}
              </span>
              {status === "error" && <span>System Fault: Execution Error</span>}
            </div>
          )}

          {/* Chart Rendering Canvas */}
          <div className="flex-1 p-6 md:p-12 flex flex-col min-h-[400px]">
            {!status && rows.length === 0 && (
              <div className="flex-1 flex items-center justify-center border border-dashed border-gray-300">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">Standby Mode</span>
              </div>
            )}

            {status === "done" && rows.length > 0 && (
              <div className="flex-1 flex flex-col bg-white border border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-8 pb-4 border-b border-gray-100 flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Visualization</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">
                      Render: {chartType} | Nodes: {rows.length}
                    </p>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-black border border-black px-3 py-1">
                    Export Output
                  </div>
                </div>
                
                <div className="flex-1 w-full min-h-[300px]">
                  {/* The Chart component renders here */}
                  <Chart rows={rows} chartType={chartType as "bar" | "line" | "pie"} />
                </div>
              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}