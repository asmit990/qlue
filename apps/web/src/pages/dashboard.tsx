import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Chart from "../components/charts";
import { useWebSocket } from "@/hooks/useWebsocket";
import { motion } from "framer-motion";

/**
 * Qlue Dashboard - Editorial Grid Edition
 * Aesthetic: Brutalist Data Analytics / High-End Report
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const schema = location.state?.schema;
  const question = location.state?.question || "Show insights";

  const { ask, status, rows, chartType, sql } = useWebSocket();

  useEffect(() => {
    if (!schema) {
      navigate("/ask");
      return;
    }
    ask(question, schema);
  }, []);

  return (
    <div className="h-screen w-full bg-white text-black font-sans flex flex-col overflow-hidden selection:bg-black selection:text-white">
      {/* 1. Diamond-Dot Canvas Background */}
      <div 
        className="fixed inset-0 opacity-[0.6] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`, 
          backgroundSize: '32px 32px' 
        }}
      ></div>

      {/* 2. Top Navigation / System Header */}
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
          className="text-[10px] font-black uppercase tracking-[0.2em] border border-black px-6 py-2 hover:bg-black hover:text-white transition-all active:scale-95"
        >
          New Analysis
        </button>
      </nav>

      {/* 3. Main Split Content Area */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Metadata & Query Context */}
        <section className="w-full md:w-[30%] border-b md:border-b-0 md:border-r border-black bg-white/40 backdrop-blur-md p-10 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">Request Input</span>
            <h2 className="text-4xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8">
              "{question}"
            </h2>
            
            <div className="space-y-6 pt-6 border-t border-black/5">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Status</span>
                <span className={`text-xs font-bold uppercase ${status === 'done' ? 'text-green-500' : 'text-black animate-pulse'}`}>
                  {status === 'done' ? 'Success' : status || 'Initializing'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Matrix Type</span>
                <span className="text-xs font-bold uppercase">{chartType || 'Pending'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Data Nodes</span>
                <span className="text-xs font-bold uppercase">{rows.length} Points</span>
              </div>
            </div>
          </motion.div>

          <div className="pt-10">
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
              Gemini AI Engine // <br/>
              SQL Protocol Secure // <br/>
              Result Set Verified.
            </p>
          </div>
        </section>

        {/* Right Side: The Visualization Canvas */}
        <section className="flex-1 relative flex flex-col bg-white">
          
          {/* Status Message Bar */}
          {(status === "thinking" || status === "querying" || status === "error") && (
            <div className={`p-4 text-[10px] font-black uppercase tracking-[0.4em] flex justify-center items-center gap-4 ${
              status === "error" ? "bg-red-50 text-red-500" : "bg-black text-white"
            }`}>
              <span className="animate-pulse">{status === "thinking" ? "Generating SQL..." : "Fetching Matrix Data..."}</span>
              {status === "error" && <span>Execution Fault</span>}
            </div>
          )}

          {/* Result Area */}
          <div className="flex-1 overflow-auto p-6 lg:p-12">
            {status === "done" && rows.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full w-full bg-white border border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col"
              >
                <div className="flex justify-between items-start mb-12">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-black border-b-2 border-black pb-2">
                    Visual Data Output
                  </h3>
                  <button className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 hover:bg-gray-800">
                    Export SVG
                  </button>
                </div>

                <div className="flex-1 min-h-[400px]">
                  <Chart rows={rows} chartType={chartType as "bar" | "line" | "pie"} />
                </div>
              </motion.div>
            ) : (
              <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-200">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Awaiting Data Payload</span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 4. Bottom Status Footer */}
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