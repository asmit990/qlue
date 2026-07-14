import SourcePicker from "@/components/connectors/SourcePicker";
import { useEffect, useMemo, useState } from "react";
import QuerySidebar from "@/components/sidebar";
import { useNavigate } from "react-router-dom";
import { listDatasets, type Dataset } from "@/lib/db";
import { useWebSocket } from "@/hooks/useWebsocket";

export default function Ask() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState("");
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();
  const authToken = localStorage.getItem("token") || "";

  const { startRemoteImport } = useWebSocket({
    onDatasetImported: (datasetId) => {
      void refreshDatasets(datasetId);
    },
  });

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

      <div
        className="fixed inset-0 opacity-[0.6] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <nav className="relative z-20 h-20 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
        <div className="flex items-center gap-4">
          <span onClick={() => { navigate("/") }} className="font-extrabold text-xl tracking-tighter">Qlue</span>
          <span className="text-gray-300 hidden md:inline">///</span>
          <span className="text-gray-400 hidden md:inline">Workspace</span>
        </div>

        <div className="flex items-center gap-6">
          {activeDataset ? (
            <span className="text-extrasmall text-green-500">Schema Active</span>
          ) : (
            <span className="text-red-500 animate-pulse">Awaiting Schema</span>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="hover:text-gray-500 transition-colors"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row">

        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-black bg-white/80 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b border-black">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Query Injectors
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <QuerySidebar
              onSelect={(item: any) => {
                setQuestion(item.question);
              }}
            />
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-transparent">

          <div className="bg-white border-b border-black flex flex-col">

            <div className="p-6 md:p-12 flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                Command Line // Input Question
              </label>

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="ENTER QUERY HERE..."
                className="w-full bg-transparent text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-black placeholder:text-gray-200 focus:outline-none"
              />

              <button
                onClick={() => {
                  if (!activeDataset) {
                    alert("Please load a dataset first.");
                    return;
                  }
                  if (!question) {
                    alert("Please enter a question.");
                    return;
                  }
                  navigate("/dashboard", {
                    state: {
                      datasetId: activeDataset.id,
                      question,
                    },
                  });
                }}
                className="self-start mt-4 px-8 py-3 border border-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
              >
                Execute
              </button>
            </div>

            <div className="flex flex-col sm:flex-row border-t border-black">

              <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-black flex items-center justify-between hover:bg-gray-50 transition-colors">

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Data Source
                  </span>
                  <SourcePicker
                    authToken={authToken}
                    onDatasetReady={handleDatasetReady}
                    startRemoteImport={startRemoteImport}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 flex flex-col min-h-[400px]">
            <div className="border border-black bg-white/80 p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Active Dataset
                  </label>
                  <select
                    value={activeDatasetId}
                    onChange={(e) => setActiveDatasetId(e.target.value)}
                    className="w-full border border-black bg-white px-4 py-3 text-sm font-medium focus:outline-none"
                  >
                    <option value="">Select a dataset</option>
                    {datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name} [{dataset.sourceType}]
                      </option>
                    ))}
                  </select>
                </div>

                {activeDataset ? (
                  <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                    <div className="border border-dashed border-gray-300 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Dataset</p>
                      <p className="mt-2 break-all font-medium text-black">{activeDataset.name}</p>
                    </div>
                    <div className="border border-dashed border-gray-300 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">SQL Table</p>
                      <p className="mt-2 break-all font-medium text-black">{activeDataset.id}</p>
                    </div>
                    <div className="border border-dashed border-gray-300 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Shape</p>
                      <p className="mt-2 font-medium text-black">
                        {activeDataset.rows.length} rows / {activeDataset.columns.length} columns
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center border border-dashed border-gray-300">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">
                      Upload CSV Or Import A Cloud Sheet To Continue
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
