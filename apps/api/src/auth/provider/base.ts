// auth/oauth/provider/base.ts

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;   // not always returned (e.g. Google on refresh calls)
  expires_at: Date;
  scope?: string;
}

export interface OAuthUserProfile {
  id: string;               // provider's unique user id
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface OAuthProvider {
  name: "google" | "github" | "microsoft";

  /** Build the redirect URL to send the user to for consent */
  getAuthUrl(state: string): string;

  /** Exchange the ?code= callback param for tokens */
  exchangeCode(code: string): Promise<OAuthTokenResponse>;

  /** Refresh an expired access token using the stored refresh token */
  refreshToken(refreshToken: string): Promise<Omit<OAuthTokenResponse, "refresh_token">>;

  /** Fetch basic profile info, used at first login to create/match a user */
  getUserProfile(accessToken: string): Promise<OAuthUserProfile>;
}