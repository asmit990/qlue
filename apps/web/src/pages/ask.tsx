import SourcePicker from "@/components/connectors/SourcePicker";
import { useEffect, useMemo, useState } from "react";
import QuerySidebar from "@/components/sidebar";
import { useNavigate } from "react-router-dom";
import { listDatasets, type Dataset } from "@/lib/db";

export default function Ask() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState("");
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  const activeDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === activeDatasetId) || null,
    [activeDatasetId, datasets]
  );

  useEffect(() => {
    void refreshDatasets();
  }, []);

  async function refreshDatasets(preferredDatasetId?: string) {
    const storedDatasets = await listDatasets();
    const sortedDatasets = [...storedDatasets].sort((left, right) =>
      right.created_at.localeCompare(left.created_at)
    );

    setDatasets(sortedDatasets);
    setActiveDatasetId((current) => {
      if (preferredDatasetId) return preferredDatasetId;
      if (current && sortedDatasets.some((dataset) => dataset.id === current)) return current;
      return sortedDatasets[0]?.id || "";
    });
  }

  function handleDatasetReady(dataset: Dataset) {
    void refreshDatasets(dataset.id);
  }

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white">
      {/* 1. Background Grid */}
      <div
        className="fixed inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* 2. Top Nav */}
      <nav className="relative z-20 h-20 border-b border-black bg-white/80 backdrop-blur-md flex items-center justify-between px-10">
        <div className="flex items-center gap-6">
          <span 
            onClick={() => navigate("/")} 
            className="text-xl font-extrabold tracking-tighter cursor-pointer hover:opacity-50 transition-opacity"
          >
            Qlue
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hidden md:inline">
            /// Workspace
          </span>
        </div>

        <div className="flex items-center gap-8 text-[10px] font-bold tracking-[0.2em] uppercase">
          {activeDataset ? (
            <span className="text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Schema Active
            </span>
          ) : (
            <span className="text-red-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Awaiting Schema
            </span>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-all"
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* 3. Main Layout */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row">
        
        {/* Left: Sidebar */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-black bg-white/60 backdrop-blur-sm flex flex-col">
          <div className="p-8 border-b border-black bg-white">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-black">
              Query Injectors
            </h2>
            <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mt-2">
              Select a pre-configured node
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <QuerySidebar
              onSelect={(item: any) => {
                setQuestion(item.question);
              }}
            />
          </div>
        </aside>

        {/* Right: Execution Engine */}
        <section className="flex-1 flex flex-col bg-transparent">
          
          {/* Top: Massive Input Area */}
          <div className="bg-white/40 backdrop-blur-sm border-b border-black flex flex-col p-8 md:p-16">
            <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 block">
              Command Line // Input Query
            </label>

            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="TYPE YOUR QUESTION HERE..."
              className="w-full bg-transparent text-4xl md:text-6xl lg:text-[5vw] font-black uppercase tracking-tighter text-black placeholder:text-gray-200 focus:outline-none mb-12 leading-none"
            />

            <button
              onClick={() => {
                if (!activeDataset) return alert("System requires an active dataset. Please load one first.");
                if (!question) return alert("Query cannot be empty.");
                navigate("/dashboard", {
                  state: {
                    datasetId: activeDataset.id,
                    question,
                  },
                });
              }}
              className="self-start px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-colors flex items-center gap-4 group"
            >
              Execute Query
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>

          {/* Bottom: Data Configuration */}
          <div className="flex-1 flex flex-col xl:flex-row bg-white">
            
            {/* Control Panel */}
            <div className="flex-1 p-8 md:p-12 border-b xl:border-b-0 xl:border-r border-black flex flex-col gap-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">
                  Connection Route
                </span>
                <div className="p-6 border border-black bg-gray-50/50">
                  <SourcePicker
                    onDatasetReady={handleDatasetReady}
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">
                  Active Dataset
                </span>
                <select
                  value={activeDatasetId}
                  onChange={(e) => setActiveDatasetId(e.target.value)}
                  className="w-full border border-black bg-white px-5 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="">-- SELECT DATASET --</option>
                  {datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} // [{dataset.sourceType}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spec Sheet Display */}
            <div className="flex-[1.2] p-8 md:p-12 bg-gray-50 flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-8">
                System Schema Specs
              </span>

              {activeDataset ? (
                <div className="flex flex-col border border-black bg-white">
                  <div className="p-6 border-b border-black grid grid-cols-3 gap-4 bg-black text-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Target File</p>
                    <p className="col-span-2 text-xs font-bold tracking-widest truncate">{activeDataset.name}</p>
                  </div>
                  
                  <div className="p-6 border-b border-black grid grid-cols-3 gap-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Virtual Table</p>
                    <p className="col-span-2 text-xs font-bold tracking-widest font-mono text-gray-600 truncate">{activeDataset.id}</p>
                  </div>

                  <div className="p-6 grid grid-cols-3 gap-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Matrix Shape</p>
                    <p className="col-span-2 text-xs font-bold tracking-widest">
                      <span className="text-black">{activeDataset.rows.length}</span> ROWS × <span className="text-black">{activeDataset.columns.length}</span> COLS
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-black border-dashed bg-white p-12 text-center">
                  <div className="text-4xl font-black text-gray-200 mb-4">✕</div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 leading-relaxed">
                    System Offline <br /> Upload CSV or sync cloud <br /> to mount database.
                  </span>
                </div>
              )}
            </div>
            
          </div>
        </section>
      </main>
    </div>
  );
}
