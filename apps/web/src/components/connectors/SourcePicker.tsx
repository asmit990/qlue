import CsvUploadButton from "@/components/upload";
import type { Dataset } from "@/lib/db";

interface SourcePickerProps {
  onDatasetReady: (dataset: Dataset) => void;
}

export default function SourcePicker({
  onDatasetReady,
}: SourcePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CsvUploadButton onUpload={onDatasetReady} />
    </div>
  );
}
