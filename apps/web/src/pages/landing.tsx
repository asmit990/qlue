
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import  CardTilt from "@/components/cardTilt";


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
    <div className="min-h-screen w-full text-black font-sans flex flex-col selection:bg-black selection:text-white relative overflow-x-hidden">

      {/* Dot grid */}
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-white pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Pink gradient — top left */}
      <div className="absolute top-[-10%] left-[-20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] pointer-events-none -z-10" />

      {/* Pink gradient — bottom right */}
      <div className="absolute bottom-0 right-[-20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] pointer-events-none -z-10" />

      {/* Nav */}
 <nav className="relative z-20 h-20 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center px-10">
  <div className="text-xl font-extrabold tracking-tighter ">
    Qlue
  </div>

  <div className="absolute right-9 flex items-center gap-8 text-[11px] font-black  tracking-[0.2em] text-gray-400">
    <button
      onClick={() => navigate("/about")}
      className="hover:text-black transition-colors"
    >
      about
    </button>

    <button
      onClick={() => navigate("/ask")}
      className="px-3 py-3 border border-black text-black hover:bg-black hover:text-white  transition-all" >
      Initialize
    </button>
  </div>
</nav>

      <main className="relative z-10 flex-1 flex flex-col">

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row border-b border-black flex-1 min-h-[75vh]">

          {/* Left: Massive Typography */}
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
                To{" "}
                <span className="not-italic text-transparent" style={{ WebkitTextStroke: "2px black" }}>
                  Qlue.
                </span>
              </h1>
            </motion.div>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex flex-col bg-white/80">
            <div className="flex-1 p-12 lg:p-16 border-b border-black flex flex-col justify-center">
              <p className="text-2xl font-bold leading-tight tracking-tight text-black italic mb-6">
                "Ask anything about your data in plain English."
              </p>
              <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-wider mb-10">
                Get an interactive dashboard — instantly. <br /> No SQL. No Setup. Just Answers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/ask")}
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
                    transition={{ delay: 0.2 + i * 0.1 }}
                    onClick={() => navigate("/ask")}
                    className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-3 bg-white hover:bg-black hover:text-white transition-colors text-left"
                  >
                    <span className="text-gray-400 mr-2 opacity-50">&gt;</span> {q}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="grid grid-cols-1 lg:grid-cols-3 bg-white/80 border-b border-black">
          {steps.map((step, index) => (
            <CardTilt key={step.n}>
              <div
                className={`p-12 lg:p-16 flex flex-col gap-8 group hover:bg-black transition-colors duration-500 cursor-default h-full ${
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
            </CardTilt>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-20 h-16 bg-white/80 border-t border-black flex items-center justify-between px-6 md:px-12 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-6 md:gap-10">
          <span className="text-black underline decoration-2 underline-offset-4">Engine Active</span>
          <span className="text-gray-400 hidden sm:inline">qlue_core_v2.1</span>
        </div>
        <div className="text-gray-400">© 2026 Qlue Systems</div>
      </footer>
    </div>
  );
}