import { useEffect, useEffectEvent, useState } from "react";
import { Files, LoaderCircle } from "lucide-react";
import CsvUploadButton from "@/components/upload";
import GoogleSheetsPicker from "@/components/connectors/GoogleSheetsPicker";
import type { Dataset } from "@/lib/db";
import { openOneDrivePicker } from "@/lib/oneDrive";

type RemoteProvider = "microsoft";
const CONNECTOR_RETURN_KEY = "qlue.pendingConnector";

interface SourcePickerProps {
  authToken: string;
  onDatasetReady: (dataset: Dataset) => void;
  startRemoteImport: (
    provider: "google" | RemoteProvider,
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const resumePendingImport = useEffectEvent((provider: RemoteProvider) => {
    void handleRemoteImport(provider, { skipOAuthRedirect: true });
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connector = params.get("connector");
    const connected = params.get("connected");
    const error = params.get("error");

    if (!connector || !connected) return;
    if (connector !== "microsoft") return;

    params.delete("connector");
    params.delete("connected");
    params.delete("error");
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);

    if (connected !== "1") {
      clearPendingConnector();
      if (error) {
        alert(`Failed to connect ${connector}: ${error}`);
      }
      return;
    }

    const pendingConnector = readPendingConnector();
    if (pendingConnector !== connector) {
      alert("Excel Online connected.");
      return;
    }

    clearPendingConnector();
    resumePendingImport(connector);
  }, [authToken]);

  async function handleRemoteImport(
    provider: RemoteProvider,
    options?: { skipOAuthRedirect?: boolean }
  ) {
    if (!authToken) {
      alert("Your session is missing. Please log in again.");
      return;
    }

    setLoadingProvider(provider);

    try {
      const accessToken = await getPickerToken(provider, authToken);
      const selectedFile = await openOneDrivePicker(accessToken);

      await startRemoteImport(provider, selectedFile.fileId, selectedFile.name, authToken);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);

      if (errorMessage === "not_connected" && !options?.skipOAuthRedirect) {
        try {
          storePendingConnector(provider);
          const authUrl = await getConnectorAuthUrl(provider, authToken);
          window.location.assign(authUrl);
          return;
        } catch (connectErr: unknown) {
          clearPendingConnector();
          console.error(`Failed to connect ${provider}:`, connectErr);
          alert(getErrorMessage(connectErr) || `Failed to connect ${provider}`);
          return;
        }
      }

      if (errorMessage === "not_connected") {
        clearPendingConnector();
        alert("Excel Online is still not connected. Please try again.");
        return;
      }

      if (errorMessage && !errorMessage.toLowerCase().includes("cancel")) {
        console.error(`Failed to import from ${provider}:`, err);
        alert(errorMessage || `Failed to import from ${provider}`);
      }
    } finally {
      setLoadingProvider("");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CsvUploadButton onUpload={onDatasetReady} />

      <GoogleSheetsPicker
        authToken={authToken}
        disabled={loadingProvider !== ""}
        onLoadingChange={setIsGoogleLoading}
        startRemoteImport={(fileId, name, token) =>
          startRemoteImport("google", fileId, name, token)
        }
      />

      <button
        type="button"
        onClick={() => void handleRemoteImport("microsoft")}
        disabled={loadingProvider !== "" || isGoogleLoading}
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

async function getConnectorAuthUrl(provider: RemoteProvider, authToken: string): Promise<string> {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}` || "/ask";
  const response = await fetch(
    `${API_URL}/api/connectors/auth-url?provider=${provider}&returnTo=${encodeURIComponent(returnTo)}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || `Failed to start ${provider} connection`);
  }

  const payload = await response.json();
  if (!payload.url) {
    throw new Error(`No ${provider} auth URL returned by the server`);
  }

  return payload.url;
}

function storePendingConnector(provider: RemoteProvider) {
  window.sessionStorage.setItem(CONNECTOR_RETURN_KEY, provider);
}

function readPendingConnector(): RemoteProvider | null {
  const provider = window.sessionStorage.getItem(CONNECTOR_RETURN_KEY);
  return provider === "microsoft" ? provider : null;
}

function clearPendingConnector() {
  window.sessionStorage.removeItem(CONNECTOR_RETURN_KEY);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}
