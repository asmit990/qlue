
import { motion } from "framer-motion";
import CardTilt from "@/components/cardTilt";
import { useNavigate } from "react-router-dom";
/**
 * Qlue About Page - Editorial Grid Edition
 * Matches the heavy sans-serif from Screenshot 2026-05-06 at 5.23.43 AM.png
 */
export default function AboutUs() {
  const token = localStorage.getItem("token");
  const navi = useNavigate()
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

      {/* 2. Top Nav */}
         <nav className="relative z-20 h-20 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
        <div onClick={() => {navi("/")}} className="text-xl font-extrabold tracking-tighter ">Qlue</div>
        <div className="flex items-center gap-8 text-[10px] font-bold  tracking-[0.2em] text-gray-500">
        <a onClick={() => { if(token) {navi("/ask")} else {navi("/login")}}} className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition-all">Sign In</a>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col">
        {/* 3. Hero Section - Massive Typography */}
        <section className="px-12 py-24 border-b border-black flex flex-col lg:flex-row justify-between items-end gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 block">
              Protocol // 002: Purpose
            </span>
            <h1 className="text-[8vw] font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
              Insight <br /> 
              <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: '1.5px black' }}>Simplified.</span>
            </h1>
          </motion.div>
          <div className="max-w-md pb-4">
            <p className="text-xl font-bold leading-tight tracking-tight text-black italic">
              "Data insights shouldn't require a data scientist."
            </p>
            <p className="mt-6 text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
              Qlue turns plain English into interactive dashboards—instantly. 
              No SQL. No setup. No waiting.
            </p>
          </div>
        </section>

        {/* 4. Features Grid - Modular Cells */}
        <section className="grid grid-cols-1 md:grid-cols-3 border-b border-black ">
          <CardTilt >
          <FeatureCell 
            number="01" 
            title="Natural Language First" 
            desc="Type what you want to know—Qlue figures out the rest. No query language, no configuration."
            className="md:border-r border-black"
          />
          </CardTilt>
          <CardTilt>
          <FeatureCell 
            number="02" 
            title="AI-Powered SQL" 
            desc="Gemini reads your data schema and writes precise queries so the charts are always accurate."
            className="md:border-r border-black"
          />
          </CardTilt>
          <CardTilt>
          <FeatureCell 
            number="03" 
            title="Bring Your Data" 
            desc="Upload any CSV and start asking questions immediately. No formatting, no migration."
          />
           </CardTilt>
        </section>
       

        {/* 5. Mission & Credits Split */}
        
        <section className="flex flex-col lg:flex-row flex-1">
           <CardTilt>
          <div className="flex-1 p-12 lg:p-24 border-r border-black bg-black text-white flex flex-col justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-600 mb-12">The Mission</h2>
            <p className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.95] uppercase italic">
              Closing the gap between <span className="text-gray-500">having data</span> and <span className="text-white underline decoration-4 underline-offset-8">understanding it</span>.
            </p>
          </div>
</CardTilt>
          <div className="flex-[0.6] p-12 lg:p-24 flex flex-col justify-end bg-white/40 backdrop-blur-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Architect</span>
              <p className="text-2xl font-black tracking-tighter uppercase">Asmit Pandey</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Full-Stack Developer · Est 2025</p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer Status Bar */}
      <footer className="relative z-20 h-16 border-t border-black bg-white flex items-center justify-between px-12 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-10">
          <span className="text-green-500 underline decoration-2 underline-offset-4">System Operational</span>
          <span className="text-gray-400 font-medium tracking-normal italic">qlue_about_v1.0.4</span>
        </div>
        <div className="text-gray-400">© 2026 Qlue</div>
      </footer>
    </div>
  );
}

function FeatureCell({ number, title, desc, className = "" }: any) {
  return (
    <div className={`p-12 lg:p-16 flex flex-col gap-10 hover:bg-black group transition-all duration-500 ${className}`}>
      <div className="text-5xl font-black tracking-tighter text-gray-200 group-hover:text-white/20 transition-colors">
        {number}
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-xs font-medium text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
          {desc}
        </p>
      </div>
    </div>
  );
}