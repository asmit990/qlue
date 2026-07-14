declare global {
  interface Window {
    OneDrive?: {
      open: (options: Record<string, unknown>) => void;
    };
  }
}

const ONEDRIVE_SDK_URL = "https://js.live.net/v7.2/OneDrive.js";

interface SelectedFile {
  fileId: string;
  name: string;
}

export async function openOneDrivePicker(accessToken: string): Promise<SelectedFile> {
  const clientId = import.meta.env.VITE_ONEDRIVE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing VITE_ONEDRIVE_CLIENT_ID for OneDrive Picker");
  }

  await loadScript(ONEDRIVE_SDK_URL, "onedrive-picker-sdk");

  return new Promise((resolve, reject) => {
    window.OneDrive?.open({
      clientId,
      action: "query",
      multiSelect: false,
      advanced: {
        accessToken,
        redirectUri: window.location.origin,
      },
      success: (response: any) => {
        const file = response?.value?.[0];

        if (!file?.id || !file?.name) {
          reject(new Error("OneDrive picker did not return a file"));
          return;
        }

        resolve({
          fileId: file.id,
          name: file.name,
        });
      },
      cancel: () => reject(new Error("OneDrive picker cancelled")),
      error: (error: any) =>
        reject(new Error(error?.message || "OneDrive picker failed")),
    });
  });
}

async function loadScript(src: string, id: string): Promise<void> {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "true") {
      return;
    }

    await waitForLoad(existing);
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
  await waitForLoad(script);
  script.dataset.loaded = "true";
}

function waitForLoad(script: HTMLScriptElement): Promise<void> {
  return new Promise((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${script.src}`)), {
      once: true,
    });
  });
}
