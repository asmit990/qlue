import CsvUploadButton from "@/components/upload";
import { useState } from "react";
import QuerySidebar from "@/components/sidebar";
import { useNavigate } from "react-router-dom";

export default function Ask() {
  const [schema, setSchema] = useState("");
  const [localDatasetId, setLocalDatasetId] = useState("");
  const [question, setQuestion] = useState("");

  const navigate = useNavigate();

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
          {schema ? (
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
                  if (!schema) {
                    alert("Please upload a CSV first.");
                    return;
                  }
                  if (!question) {
                    alert("Please enter a question.");
                    return;
                  }
                  navigate("/dashboard", {
                    state: {
                      schema,
                      localDatasetId,
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

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Data Source
                </span>

                <CsvUploadButton
                  onUpload={(uploadedSchema: string, uploadedLocalDatasetId: string) => {
                    setSchema(uploadedSchema);
                    setLocalDatasetId(uploadedLocalDatasetId);

                    if (!question) {
                      return;
                    } else {
                      navigate("/dashboard", {
                        state: {
                          schema: uploadedSchema,
                          localDatasetId: uploadedLocalDatasetId,
                          question,
                        },
                      });
                    }
                  }}
                />
              </div>

            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 flex flex-col min-h-[400px]">
            <div className="flex-1 flex items-center justify-center border border-dashed border-gray-300">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">
                Upload CSV To Continue
              </span>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}