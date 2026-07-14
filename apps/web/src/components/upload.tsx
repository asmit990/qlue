import { Upload } from "lucide-react";
import { parseAndStoreCSV } from "@/lib/csvParser";
import type { Dataset } from "@/lib/db";

interface Props {
  onUpload: (dataset: Dataset) => void;
}

export default function CsvUploadButton({ onUpload }: Props) {

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataset = await parseAndStoreCSV(file);
      onUpload(dataset);
    } catch (err: any) {
      console.error("Failed to parse CSV:", err.message);
      alert(`Failed to parse CSV: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-black px-6 py-3 text-white shadow-lg transition hover:scale-105">
      <Upload size={18} />
      <span className="font-medium">Upload CSV</span>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleUpload}
      />
    </label>
  );
}
