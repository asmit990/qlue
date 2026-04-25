import { Upload } from "lucide-react";

export default function CsvUploadButton() {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-black px-6 py-3 text-white shadow-lg transition hover:scale-105">
      <Upload size={18} />
      <span className="font-medium">Upload CSV</span>

      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log("Selected file:", file.name);
          }
        }}
      />
    </label>
  );
}