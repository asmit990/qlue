// auth/oauth/provider/microsoft.ts
import { OAuthProvider, OAuthTokenResponse, OAuthUserProfile } from "./base";

const MS_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MS_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const MS_USERINFO_URL = "https://graph.microsoft.com/v1.0/me";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "offline_access",           // required to get a refresh_token
  "Files.Read",
  "Files.Read.All",
].join(" ");

export const microsoftProvider: OAuthProvider = {
  name: "microsoft",

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID!,
      redirect_uri: process.env.MS_REDIRECT_URI!,
      response_type: "code",
      response_mode: "query",
      scope: SCOPES,
      state,
    });
    return `${MS_AUTH_URL}?${params.toString()}`;
  },

  async exchangeCode(code: string): Promise<OAuthTokenResponse> {
    const res = await fetch(MS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MS_CLIENT_ID!,
        client_secret: process.env.MS_CLIENT_SECRET!,
        redirect_uri: process.env.MS_REDIRECT_URI!,
        grant_type: "authorization_code",
        scope: SCOPES,
      }),
    });
    if (!res.ok) throw new Error(`Microsoft token exchange failed: ${res.status}`);
    const data = await res.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000),
      scope: data.scope,
    };
  },

  async refreshToken(refreshToken: string) {
    const res = await fetch(MS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.MS_CLIENT_ID!,
        client_secret: process.env.MS_CLIENT_SECRET!,
        grant_type: "refresh_token",
        scope: SCOPES,
      }),
    });
    if (!res.ok) throw new Error(`Microsoft token refresh failed: ${res.status}`);
    const data = await res.json();
    return {
      access_token: data.access_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000),
    };
  },

  async getUserProfile(accessToken: string): Promise<OAuthUserProfile> {
    const res = await fetch(MS_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Microsoft userinfo failed: ${res.status}`);
    const data = await res.json();
    return {
      id: data.id,
      email: data.mail ?? data.userPrincipalName,
      name: data.displayName,
    };
  },
};