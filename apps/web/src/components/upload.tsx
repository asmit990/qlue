import { Upload } from "lucide-react";

interface Props {
  onUpload: (schema: string) => void;
}

export default function CsvUploadButton({ onUpload }: Props) {

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Schema:", data.schema);
    onUpload(data.schema);
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