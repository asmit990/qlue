import CsvUploadButton from "@/components/upload";

export default function Ask() {
  return (
     
    <div className="relative min-h-screen bg-white" style={{
        backgroundImage:
          "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="p-4 text-5xl font-bold text-black">Ask Qlue</h1>

        <p className="mt-2 text-center text-xl text-gray-600">
          What would you like to know about your data?
        </p>

        <div className="mt-8 w-full max-w-2xl">
          <input
            type="text"
            placeholder="Type your question here..."
            className="w-full rounded-full border border-gray-300 px-6 py-4 text-lg shadow-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>
      </div>

      <div className="absolute bottom-47 left-1/2 -translate-x-1/2 ">
        <CsvUploadButton />
      </div>
    </div>
  );
}