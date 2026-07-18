import { motion } from "framer-motion";
import CardTilt from "@/components/cardTilt";
import { useNavigate } from "react-router-dom";

// --- DATA ARRAYS (DRY) ---

const FEATURES = [
  { n: "01", title: "Zero-Egress Execution", desc: "PapaParse & sql.js run locally. Raw data never touches our server." },
  { n: "02", title: "Schema-Only AI", desc: "Gemini 2.5 Flash reads only column semantics to generate optimal SQL & charts." },
  { n: "03", title: "Real-time Pipeline", desc: "RabbitMQ handles concurrency while WebSockets stream live status updates." }
];

const DIRECTIVES = [
  { id: "D-01", title: "Data Sovereignty", text: "Your data is yours. By compiling SQLite to WebAssembly, the entire database engine runs inside your browser tab. We don't want your data, and our servers never see it." },
  { id: "D-02", title: "AI as a Bridge", text: "LLMs shouldn't be black boxes. Qlue uses AI strictly as a translation layer—converting human intent into deterministic SQL logic, ensuring hallucinations never skew your metrics." },
  { id: "D-03", title: "Zero Friction", text: "No onboarding, no configuration files, no data mapping. Drop a CSV into the browser and start typing. Insight should be immediate, not a multi-day sprint." }
];

const SPECS = [
  { label: "Client Engine", tech: "React 19 . WebAssembly . IndexedDB" },
  { label: "AI Inference", tech: "Google Gemini 2.5 Flash" },
  { label: "Broker & Comm", tech: "RabbitMQ . WebSockets" },
  { label: "Infrastructure", tech: "Express 5 . PostgreSQL . TS" }
];

const LINKS = [
  { label: "Source Code // GitHub", url: "https://github.com/asmit990/qlue" },
  { label: "Developer Profile", url: "https://github.com/asmit990" },
];

// --- COMPONENT ---

export default function AboutUs() {
  const token = localStorage.getItem("token");
  const navi = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 opacity-60 pointer-events-none bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Nav */}
      <nav className="relative z-20 h-20 border-b border-black bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
        <div onClick={() => navi("/")} className="text-xl font-extrabold tracking-tighter cursor-pointer">Qlue</div>
        <button 
          onClick={() => navi(token ? "/ask" : "/login")} 
          className="px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase border border-black hover:bg-black hover:text-white transition-all"
        >
          {token ? "Dashboard" : "Sign In"}
        </button>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col">
        {/* 1. Hero */}
        <section className="px-12 py-24 border-b border-black flex flex-col lg:flex-row justify-between items-end gap-12 bg-white/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 block">Protocol // 002: Architecture</span>
            <h1 className="text-[8vw] font-black leading-[0.85] tracking-tight uppercase italic">
              Insight <br /> <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: '1.5px black' }}>Simplified.</span>
            </h1>
          </motion.div>
          <div className="max-w-md pb-4">
            <p className="text-xl font-bold leading-tight text-black italic">"Data insights shouldn't require a data scientist."</p>
            <p className="mt-4 text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
              Qlue bridges human language and databases. No SQL, no raw data leaving your browser. Just ask and visualize.
            </p>
          </div>
        </section>

        {/* 2. The Paradigm Shift (Old vs New) */}
        <section className="flex flex-col lg:flex-row border-b border-black">
          {/* Legacy BI */}
          <div className="flex-1 p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-black bg-black text-white flex flex-col justify-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-red-500 mb-8 block">Legacy BI // The Bottleneck</span>
            <ul className="space-y-8 text-xs font-bold tracking-widest uppercase text-gray-400">
               <li className="flex gap-6 items-start">
                 <span className="text-red-500 text-lg leading-none">✕</span> 
                 <span>Data locked behind heavy technical barriers and SQL dependencies.</span>
               </li>
               <li className="flex gap-6 items-start">
                 <span className="text-red-500 text-lg leading-none">✕</span> 
                 <span>Non-technical teams wait days for data engineers to build dashboards.</span>
               </li>
               <li className="flex gap-6 items-start">
                 <span className="text-red-500 text-lg leading-none">✕</span> 
                 <span>Raw, sensitive company data must be uploaded to third-party servers.</span>
               </li>
            </ul>
          </div>
          {/* Qlue Way */}
          <div className="flex-1 p-12 lg:p-24 bg-white text-black flex flex-col justify-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-green-600 mb-8 block">Qlue // The Solution</span>
             <ul className="space-y-8 text-xs font-bold tracking-widest uppercase text-gray-600">
               <li className="flex gap-6 items-start">
                 <span className="text-green-500 text-lg leading-none">✓</span> 
                 <span>Type plain English. Get an interactive Recharts dashboard instantly.</span>
               </li>
               <li className="flex gap-6 items-start">
                 <span className="text-green-500 text-lg leading-none">✓</span> 
                 <span>Zero SQL required. Gemini AI translates intent into optimized queries.</span>
               </li>
               <li className="flex gap-6 items-start">
                 <span className="text-green-500 text-lg leading-none">✓</span> 
                 <span>100% in-browser execution via WASM. Your data never leaves your device.</span>
               </li>
            </ul>
          </div>
        </section>

        {/* 3. Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 border-b border-black bg-white/80">
          {FEATURES.map((f, i) => (
            <CardTilt key={f.n}>
              <div className={`p-12 lg:p-16 flex flex-col justify-between h-full hover:bg-black group transition-colors duration-500 ${i !== 2 ? 'md:border-r border-black' : ''}`}>
                <div className="text-5xl font-black tracking-tighter text-gray-200 group-hover:text-white/20">{f.n}</div>
                <div className="mt-12 space-y-4">
                  <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-white">{f.title}</h3>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest group-hover:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </CardTilt>
          ))}
        </section>

        {/* 4. Core Directives (Manifesto) */}
        <section className="bg-gray-50/50 backdrop-blur-sm border-b border-black p-12 lg:p-24">
          <div className="max-w-7xl mx-auto">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-16 block text-center">Core Directives</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
              {DIRECTIVES.map(dir => (
                <div key={dir.id} className="flex flex-col gap-6">
                  <div className="inline-block border border-black px-3 py-1 bg-white self-start">
                    <span className="text-[10px] font-black tracking-[0.2em]">{dir.id}</span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight">{dir.title}</h4>
                  <p className="text-xs font-medium leading-relaxed text-gray-500 uppercase tracking-wider">{dir.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Mission & Specs Split */}
        <section className="flex flex-col lg:flex-row border-b border-black">
          <CardTilt>
            <div className="flex-1 p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-black bg-black text-white flex flex-col justify-between h-full">
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500 mb-12">The Mission</h2>
              <p className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] uppercase italic">
                Closing the gap between <span className="text-gray-500">having data</span> and <span className="text-white underline decoration-4 underline-offset-8">understanding it</span>.
              </p>
            </div>
          </CardTilt>
          
          <div className="flex-[0.8] p-12 lg:p-24 bg-white/60 backdrop-blur-sm flex flex-col justify-between">
            <div className="mb-12">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-2">Architect</span>
              <p className="text-2xl font-black tracking-tighter uppercase">Asmit Pandey</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Full-Stack Developer · Est 2026</p>
            </div>

            <div className="border-t border-black pt-8 w-full">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-6">System Specifications</span>
              <ul className="space-y-4">
                {SPECS.map(spec => (
                  <li key={spec.label} className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest border-b border-gray-200 pb-2">
                    <span className="text-black">{spec.label}</span>
                    <span className="text-gray-500 text-right">{spec.tech}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Developer Origin & Links */}
        <section className="grid grid-cols-1 lg:grid-cols-2 bg-white">
          <div className="p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-black flex flex-col justify-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 block">Origin Story</span>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-black italic">
              "I built Qlue because non-technical teams shouldn't have to wait days for a simple SQL query. By combining WASM-based local databases with AI schema parsing, I wanted to prove that enterprise-grade analytics doesn't require an enterprise-grade setup. It should feel like magic, but be rooted in secure engineering."
            </p>
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              — Asmit Pandey // Creator
            </p>
          </div>

          <div className="p-12 lg:p-24 bg-gray-50/50 backdrop-blur-sm flex flex-col justify-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 block">Open Source Network</span>
            <div className="flex flex-col gap-4">
              {LINKS.map(link => (
                <a 
                  key={link.label} 
                  href={link.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex justify-between items-center p-6 border border-black bg-white hover:bg-black hover:text-white transition-all group"
                >
                  <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
                  <span className="font-mono group-hover:translate-x-2 transition-transform">→</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="relative z-20 h-16 border-t border-black bg-white flex items-center justify-between px-12 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-10">
          <span className="text-green-500 underline decoration-2 underline-offset-4">System Operational</span>
          <span className="text-gray-400 font-medium tracking-normal italic hidden sm:inline">qlue_about_v3.0.0</span>
        </div>
        <div className="text-gray-400">© 2026 Qlue Systems</div>
      </footer>
    </div>
  );
}