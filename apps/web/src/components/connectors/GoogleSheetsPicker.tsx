import { useEffect, useEffectEvent, useState } from "react";
import { FileSpreadsheet, LoaderCircle } from "lucide-react";
import { openGoogleSheetsPicker } from "@/lib/connectors/googleSheets";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PENDING_IMPORT_KEY = "qlue.pendingGoogleSheetsImport";

interface GoogleSheetsPickerProps {
  authToken: string;
  disabled?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
  startRemoteImport: (fileId: string, name: string, authToken: string) => Promise<void>;
}

/**
 * Opens Google's spreadsheet picker and queues the selected workbook for import.
 * If the user's Google account has not been connected yet, it starts OAuth and
 * resumes the picker automatically when the browser returns to this page.
 */
export default function GoogleSheetsPicker({
  authToken,
  disabled = false,
  onLoadingChange,
  startRemoteImport,
}: GoogleSheetsPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const resumeImport = useEffectEvent(() => {
    void handleImport(true);
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connector = params.get("connector");
    const connected = params.get("connected");
    const error = params.get("error");

    if (connector !== "google" || !connected) return;

    params.delete("connector");
    params.delete("connected");
    params.delete("error");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );

    const shouldResume = window.sessionStorage.getItem(PENDING_IMPORT_KEY) === "true";
    window.sessionStorage.removeItem(PENDING_IMPORT_KEY);

    if (connected !== "1") {
      alert(`Failed to connect Google Sheets${error ? `: ${error}` : ""}`);
      return;
    }

    if (shouldResume) {
      resumeImport();
    } else {
      alert("Google Sheets connected.");
    }
  }, [authToken]);

  async function handleImport(skipOAuthRedirect = false) {
    if (!authToken) {
      alert("Your session is missing. Please log in again.");
      return;
    }

    setIsLoading(true);
    onLoadingChange?.(true);

    try {
      const accessToken = await getPickerToken(authToken);
      const selectedFile = await openGoogleSheetsPicker(accessToken);
      await startRemoteImport(selectedFile.fileId, selectedFile.name, authToken);
    } catch (error: unknown) {
      const message = getErrorMessage(error);

      if (message === "not_connected" && !skipOAuthRedirect) {
        try {
          window.sessionStorage.setItem(PENDING_IMPORT_KEY, "true");
          window.location.assign(await getConnectorAuthUrl(authToken));
          return;
        } catch (connectError: unknown) {
          window.sessionStorage.removeItem(PENDING_IMPORT_KEY);
          alert(getErrorMessage(connectError) || "Failed to connect Google Sheets");
          return;
        }
      }

      if (message === "not_connected") {
        alert("Google Sheets is still not connected. Please try again.");
        return;
      }

      if (message && !message.toLowerCase().includes("cancel")) {
        console.error("Failed to import from Google Sheets:", error);
        alert(message);
      }
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleImport()}
      disabled={disabled || isLoading}
      className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      {isLoading ? <LoaderCircle className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
      Google Sheets
    </button>
  );
}

async function getPickerToken(authToken: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/connectors/picker-token?provider=google`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || "Failed to fetch Google picker token");
  }

  const payload = await response.json();
  if (!payload.accessToken) throw new Error("No Google picker token returned by the server");
  return payload.accessToken;
}

async function getConnectorAuthUrl(authToken: string): Promise<string> {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}` || "/ask";
  const response = await fetch(
    `${API_URL}/api/connectors/auth-url?provider=google&returnTo=${encodeURIComponent(returnTo)}`,
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || "Failed to start Google Sheets connection");
  }

  const payload = await response.json();
  if (!payload.url) throw new Error("No Google Sheets auth URL returned by the server");
  return payload.url;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}
