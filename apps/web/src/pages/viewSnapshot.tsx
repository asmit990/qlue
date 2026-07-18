import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "@/components/charts";
import type { ChartType } from "@/store/chartStore";

export default function ViewSnapshot() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("snapshot");

      if (!encoded) throw new Error("No snapshot found in URL.");

      // Decode the Base64 string back into JSON
      const decodedPayload = JSON.parse(decodeURIComponent(atob(encoded)));
      setSnapshot(decodedPayload);
    } catch (err) {
      setError("Failed to load snapshot. The link might be broken or incomplete.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center bg-white text-black">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-red-500">Error</h1>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">{error}</p>
        <button onClick={() => navigate("/")} className="mt-8 border border-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white">
          Return Home
        </button>
      </div>
    );
  }

  if (!snapshot) return null; // Or a loading spinner

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans flex flex-col">
      {/* Brutalist Header */}
      <nav className="h-20 border-b border-black flex items-center justify-between px-10 bg-gray-50">
        <div className="font-extrabold text-xl tracking-tighter">Qlue <span className="text-gray-400 font-normal tracking-normal">// Snapshot</span></div>
        <button onClick={() => navigate("/ask")} className="border border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white">
          Create Your Own
        </button>
      </nav>

      <main className="flex-1 flex flex-col p-8 md:p-16">
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 block mb-4">
            Shared Insight
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black italic">
            "{snapshot.q}"
          </h1>
        </div>

        <div className="flex-1 border border-black p-8 bg-white/50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-full h-full min-h-[400px] flex items-center justify-center">
            <Chart rows={snapshot.d} chartType={snapshot.t as ChartType} />
          </div>
          
        </div>
      </main>
    </div>
  );
}
