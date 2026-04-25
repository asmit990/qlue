import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-white"
      style={{
        backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-6 z-20">
        <span className="text-lg font-bold tracking-tight text-black">Qlue</span>
        <div className="flex items-center gap-8 text-sm text-gray-500">
          <button onClick={() => navigate("/about")} className="hover:text-black transition-colors">About</button>
          <button
            onClick={() => navigate("/app")}
            className="bg-black text-white text-sm px-5 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col min-h-screen items-center justify-center px-6 text-center">
        <p className="text-xs tracking-widest uppercase text-gray-400 mb-6">
          AI-powered business intelligence
        </p>

        <h1 className="text-6xl md:text-8xl font-bold text-black about-headline  mb-4">
          welcome to{" "}
          <em style={{ fontFamily: "cursive", fontWeight: 400 }}>Qlue</em>
        </h1>

        <em className="text-gray-500 text-lg md:text-xl max-w-md mt-4 mb-10 leading-relaxed font-light">
          Ask anything about your data in plain English.
          Get an interactive dashboard — instantly.
        </em>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app")}
            className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Get Started →
          </button>
          <button
            onClick={() => navigate("/about")}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Learn more
          </button>
        </div>

        {/* Example queries */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 max-w-xl">
          {[
            "Top 5 products by revenue",
            "Monthly sales Q3",
            "Region wise breakdown",
            "Compare Q1 vs Q2",
          ].map((q) => (
            <button
              key={q}
              onClick={() => navigate("/app")}
              className="text-xs text-gray-400 border border-gray-200 bg-white/70 backdrop-blur px-4 py-2 rounded-full hover:border-gray-400 hover:text-gray-700 transition-all"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="relative z-10 flex flex-col items-center px-6 pb-32 text-center">
        <div className="w-10 h-px bg-gray-200 mb-16" />

        <p className="text-xs tracking-widest uppercase text-gray-400 mb-12">
          How it works
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl w-full">
          {[
            { n: "01", title: "Type your question", desc: "Ask anything in plain English — no SQL, no setup." },
            { n: "02", title: "AI writes the query", desc: "Gemini reads your schema and fetches the exact data." },
            { n: "03", title: "Dashboard appears", desc: "Charts render instantly with the right visualizations." },
          ].map((step) => (
            <div
              key={step.n}
              className="bg-white/80 backdrop-blur border border-gray-100 rounded-2xl p-8 text-left hover:border-gray-300 transition-colors"
            >
              <div className="text-3xl font-light text-gray-200 mb-4">{step.n}</div>
              <div className="text-sm font-medium text-black mb-2">{step.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed font-light">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}