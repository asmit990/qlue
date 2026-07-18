import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type OAuthCallbackProps = {
  provider: "google" | "microsoft";
};

/**
 * Google and Microsoft may be configured with the deployed frontend as their
 * redirect URI. The actual code exchange must still happen on the API, where
 * the client secret is kept. Relay the provider callback there without ever
 * exposing its parameters to application code or logs.
 */
export default function OAuthCallback({ provider }: OAuthCallbackProps) {
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (!params.get("state")) {
      setError("The connection link is missing its security state. Return to Qlue and try again.");
      return;
    }

    // Use a full-page navigation so the API can exchange the one-time code and
    // then redirect the browser back to the requested Qlue page.
    window.location.replace(`${API_URL}/auth/${provider}/callback?${params.toString()}`);
  }, [provider]);

  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-black">
      <div className="w-full max-w-md border border-black p-8 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold">Connection could not continue</h1>
            <p className="mt-3 text-sm text-gray-600">{error}</p>
            <a className="mt-6 inline-block border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white" href="/ask">
              Back to Qlue
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <h1 className="mt-5 text-xl font-bold">Finishing your connection</h1>
            <p className="mt-2 text-sm text-gray-600">You’ll return to Qlue automatically.</p>
          </>
        )}
      </div>
    </main>
  );
}
