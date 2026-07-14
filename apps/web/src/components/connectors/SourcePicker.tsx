import { useState } from "react";
import { FileSpreadsheet, Files, LoaderCircle } from "lucide-react";
import CsvUploadButton from "@/components/upload";
import type { Dataset } from "@/lib/db";
import { openGoogleSheetsPicker } from "@/lib/connectors/googleSheets";
import { openOneDrivePicker } from "@/lib/oneDrive";

type RemoteProvider = "google" | "microsoft";

interface SourcePickerProps {
  authToken: string;
  onDatasetReady: (dataset: Dataset) => void;
  startRemoteImport: (
    provider: RemoteProvider,
    fileId: string,
    name: string,
    authToken: string
  ) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SourcePicker({
  authToken,
  onDatasetReady,
  startRemoteImport,
}: SourcePickerProps) {
  const [loadingProvider, setLoadingProvider] = useState<RemoteProvider | "csv" | "">("");

  async function handleRemoteImport(provider: RemoteProvider) {
    if (!authToken) {
      alert("Your session is missing. Please log in again.");
      return;
    }

    setLoadingProvider(provider);

    try {
      const accessToken = await getPickerToken(provider, authToken);
      const selectedFile =
        provider === "google"
          ? await openGoogleSheetsPicker(accessToken)
          : await openOneDrivePicker(accessToken);

      await startRemoteImport(provider, selectedFile.fileId, selectedFile.name, authToken);
    } catch (err: any) {
      if (err?.message && !`${err.message}`.toLowerCase().includes("cancel")) {
        console.error(`Failed to import from ${provider}:`, err);
        alert(err.message || `Failed to import from ${provider}`);
      }
    } finally {
      setLoadingProvider("");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CsvUploadButton onUpload={onDatasetReady} />

      <button
        type="button"
        onClick={() => void handleRemoteImport("google")}
        disabled={loadingProvider !== ""}
        className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        {loadingProvider === "google" ? <LoaderCircle className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
        Google Sheets
      </button>

      <button
        type="button"
        onClick={() => void handleRemoteImport("microsoft")}
        disabled={loadingProvider !== ""}
        className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        {loadingProvider === "microsoft" ? <LoaderCircle className="animate-spin" size={18} /> : <Files size={18} />}
        Excel Online
      </button>
    </div>
  );
}

async function getPickerToken(provider: RemoteProvider, authToken: string): Promise<string> {
  const response = await fetch(
    `${API_URL}/api/connectors/picker-token?provider=${provider}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || `Failed to fetch ${provider} picker token`);
  }

  const payload = await response.json();
  if (!payload.accessToken) {
    throw new Error(`No ${provider} picker token returned by the server`);
  }

  return payload.accessToken;
}
