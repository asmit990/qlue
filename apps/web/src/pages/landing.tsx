import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Qlue Landing Page - Editorial Grid Edition
 * Aesthetic: Brutalist Data / Structural Canvas
 */
export default function Landing() {
  const navigate = useNavigate();

  const queries = [
    "Top 5 products by revenue",
    "Monthly sales Q3",
    "Region wise breakdown",
    "Compare Q1 vs Q2",
  ];

  const steps = [
    { n: "01", title: "Type your question", desc: "Ask anything in plain English — no SQL, no setup." },
    { n: "02", title: "AI writes the query", desc: "Gemini reads your schema and fetches the exact data." },
    { n: "03", title: "Dashboard appears", desc: "Charts render instantly with the right visualizations." },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white relative">
      {/* 1. Diamond-Dot Canvas Background */}
      <div 
        className="fixed inset-0 opacity-[0.6] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`, 
          backgroundSize: '32px 32px' 
        }}
      ></div>

      {/* 2. Top Nav */}
      <nav className="relative z-20 h-24 border-b border-black bg-white flex items-center justify-between px-6 md:px-12">
        <div className="text-3xl font-extrabold tracking-tighter uppercase">Qlue</div>
        <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          <button onClick={() => navigate("/about")} className="hover:text-black transition-colors">Protocol</button>
          <button
            onClick={() => navigate("/ask")}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all border border-black"
          >
            Initialize
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col">
        {/* 3. Hero Section Split */}
        <section className="flex flex-col lg:flex-row border-b border-black flex-1 min-h-[75vh]">
          
          {/* Left Side: Massive Typography */}
          <div className="flex-[1.2] p-12 lg:p-24 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-black bg-white/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 block">
                System Interface // BI-01
              </span>
              <h1 className="text-[12vw] lg:text-[8vw] font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
                Welcome <br /> 
                To <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: '2px black' }}>Qlue.</span>
              </h1>
            </motion.div>
          </div>

          {/* Right Side: Actions & Examples */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 p-12 lg:p-16 border-b border-black flex flex-col justify-center">
              <p className="text-2xl font-bold leading-tight tracking-tight text-black italic mb-6">
                "Ask anything about your data in plain English."
              </p>
              <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-wider mb-10">
                Get an interactive dashboard — instantly. <br/> No SQL. No Setup. Just Answers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/app")}
                  className="flex-[1.5] bg-black text-white px-8 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors flex justify-between items-center group"
                >
                  <span>Get Started</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="flex-1 border border-black px-8 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="p-12 lg:p-16 bg-gray-50/80 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">
                Query Injectors // Pre-configured
              </p>
              <div className="flex flex-wrap gap-3">
                {queries.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    onClick={() => navigate("/app")}
                    className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-3 bg-white hover:bg-black hover:text-white transition-colors text-left"
                  >
                    <span className="text-gray-400 mr-2 opacity-50">&gt;</span> {q}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. How It Works Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 bg-white border-b border-black">
          {steps.map((step, index) => (
            <div
              key={step.n}
              className={`p-12 lg:p-16 flex flex-col gap-8 group hover:bg-black transition-colors duration-500 cursor-default ${
                index !== 2 ? "lg:border-r border-b lg:border-b-0 border-black" : ""
              }`}
            >
              <div className="text-5xl font-black tracking-tighter text-gray-200 group-hover:text-white/20 transition-colors">
                {step.n}
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tighter text-black group-hover:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors uppercase tracking-widest">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* 5. Footer Status Bar */}
      <footer className="relative z-20 h-16 bg-white flex items-center justify-between px-6 md:px-12 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-6 md:gap-10">
          <span className="text-black underline decoration-2 underline-offset-4">Engine Active</span>
          <span className="text-gray-400 hidden sm:inline">qlue_core_v2.1</span>
        </div>
        <div className="text-gray-400">© 2026 Qlue Systems</div>
      </footer>
    </div>
  );
}