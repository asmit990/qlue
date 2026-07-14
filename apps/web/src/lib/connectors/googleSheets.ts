declare global {
  interface Window {
    gapi?: {
      load: (libraries: string, callback: { callback: () => void }) => void;
    };
    google?: {
      picker: any;
    };
  }
}

const GOOGLE_API_SCRIPT_URL = "https://apis.google.com/js/api.js";

interface SelectedFile {
  fileId: string;
  name: string;
}

export async function openGoogleSheetsPicker(accessToken: string): Promise<SelectedFile> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const appId = import.meta.env.VITE_GOOGLE_APP_ID;

  if (!apiKey || !appId) {
    throw new Error("Missing VITE_GOOGLE_API_KEY or VITE_GOOGLE_APP_ID for Google Picker");
  }

  await loadScript(GOOGLE_API_SCRIPT_URL, "google-picker-sdk");
  await loadGooglePickerLibrary();

  return new Promise((resolve, reject) => {
    const google = window.google;
    if (!google?.picker) {
      reject(new Error("Google Picker API failed to initialize"));
      return;
    }

    const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS)
      .setIncludeFolders(false)
      .setSelectFolderEnabled(false);

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setAppId(appId)
      .setCallback((data: any) => {
        const action = data?.action;

        if (action === google.picker.Action.PICKED) {
          const doc = data.docs?.[0];
          if (!doc?.id || !doc?.name) {
            reject(new Error("Google Picker did not return a file"));
            return;
          }

          resolve({
            fileId: doc.id,
            name: doc.name,
          });
          return;
        }

        if (action === google.picker.Action.CANCEL) {
          reject(new Error("Google Picker cancelled"));
        }
      })
      .build();

    picker.setVisible(true);
  });
}

async function loadGooglePickerLibrary(): Promise<void> {
  if (!window.gapi) {
    throw new Error("Google API script failed to load");
  }

  await new Promise<void>((resolve) => {
    window.gapi?.load("picker", { callback: resolve });
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
