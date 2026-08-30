import axios from "axios";

/**
 * OIDC/OAuth layer for the Dex-only backend (app-mesh `feature/dex`).
 *
 * The daemon no longer issues, renews, or cookies tokens: it only verifies Dex
 * bearers. The browser obtains tokens directly from Dex, which is re-exposed on
 * the public surface under the issuer path (`/auth/*`) by the Go Agent / nginx,
 * so every request below stays same-origin. Tokens live in sessionStorage and
 * are fed to the SDK client via `set_bearer_token()` (see appmeshClient.js).
 */

const TOKEN_STORE_KEY = "appmesh_oidc";
const PKCE_STORE_KEY = "appmesh_pkce";
const EXPIRY_SKEW_MS = 30 * 1000;

// Pre-registered Dex browser client (authorization-code + PKCE). The password
// grant instead uses `public_client_id` from /appmesh/auth/config.
const WEB_CLIENT_ID = "appmesh-web";

let authConfig = null;
let authConfigPromise = null;
let tokens = restoreTokens();
let refreshPromise = null;

function restoreTokens() {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.access_token ? parsed : null;
  } catch {
    return null;
  }
}

function persistTokens() {
  if (tokens) {
    sessionStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(tokens));
  } else {
    sessionStorage.removeItem(TOKEN_STORE_KEY);
  }
}

/**
 * Engine's public OAuth/OIDC configuration (unauthenticated endpoint).
 * @returns {Promise<{issuer:string,resource:string,audience:string,public_client_id:string,scopes:string[],flows:string[],first_admin_enrollment:Object}>}
 */
export function getAuthConfig() {
  if (authConfig) return Promise.resolve(authConfig);
  if (!authConfigPromise) {
    authConfigPromise = axios
      .get("/appmesh/auth/config")
      .then((res) => {
        authConfig = res.data;
        authConfigPromise = null;
        return authConfig;
      })
      .catch((error) => {
        authConfigPromise = null;
        throw error;
      });
  }
  return authConfigPromise;
}

/**
 * Browser-reachable base URL of the authentication service. The configured
 * issuer is a loopback address (http://127.0.0.1:6062/auth); the Agent/nginx
 * re-expose it on this origin under the issuer path.
 */
export function authBaseUrl() {
  return getAuthConfig().then((cfg) => {
    const issuerPath = new URL(cfg.issuer).pathname.replace(/\/+$/, "");
    return `${window.location.origin}${issuerPath}`;
  });
}

function oauthErrorMessage(error) {
  const payload = error?.response?.data;
  if (payload?.error_description) return `${payload.error}: ${payload.error_description}`;
  if (payload?.error) return String(payload.error);
  return error?.message || "Authentication service request failed";
}

async function tokenRequest(form) {
  const base = await authBaseUrl();
  try {
    const { data } = await axios.post(
      `${base}/token`,
      new URLSearchParams(form).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    if (!data?.access_token) {
      throw new Error("The authentication service returned no access token");
    }
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("no access token")) throw error;
    throw new Error(oauthErrorMessage(error));
  }
}

function installTokens(data, clientId) {
  tokens = {
    access_token: data.access_token,
    // Dex rotates refresh tokens; keep the previous one when the response omits it.
    refresh_token: data.refresh_token || tokens?.refresh_token || null,
    client_id: clientId,
    expires_at: Date.now() + (Number(data.expires_in) || 0) * 1000,
  };
  persistTokens();
  return tokens.access_token;
}

/** Current stored access token (sync; no refresh attempt). */
export function getAccessToken() {
  return tokens?.access_token || null;
}

/** A token is stored (used to decide whether to call the API or go to login). */
export function hasSession() {
  return !!tokens?.access_token;
}

function tokenNearExpiry() {
  return (
    !tokens?.access_token ||
    (tokens.expires_at && Date.now() > tokens.expires_at - EXPIRY_SKEW_MS)
  );
}

/** Drop the local session (does not contact Dex). */
export function clearSession() {
  tokens = null;
  refreshPromise = null;
  persistTokens();
}

function scopeString(cfg) {
  // auth/config scopes already include the injected audience scope
  // audience:server:client_id:<audience> required for the daemon to accept the token.
  return (cfg.scopes || ["openid", "profile", "email"]).join(" ");
}

// The built-in password source matches packaged identities by email. Expand
// short names to their email form, exactly like the CLI does.
const BUILTIN_EMAIL_DOMAIN = "appmesh.local";

/**
 * Direct password grant against Dex (only advertised in builtin auth mode).
 * Dex local identities are full emails, e.g. admin@appmesh.local; a short
 * name like "admin" is expanded automatically.
 * @returns {Promise<string>} access token
 */
export async function passwordLogin(username, password) {
  const cfg = await getAuthConfig();
  const user = username.includes("@")
    ? username
    : `${username}@${BUILTIN_EMAIL_DOMAIN}`;
  const form = {
    grant_type: "password",
    username: user,
    password,
    scope: scopeString(cfg),
    client_id: cfg.public_client_id,
  };
  return installTokens(await tokenRequest(form), cfg.public_client_id);
}

// ---- Authorization-code + PKCE (browser client `appmesh-web`) ----

function randomUrlSafe(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

function base64Url(bytes) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function pkceChallenge(verifier) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

function webRedirectUri() {
  return `${window.location.origin}/oauth/callback`;
}

/**
 * Start the authorization-code flow. In popup mode the provider login opens in
 * a small window and the SPA stays loaded; the popup relays the code back via
 * postMessage (see completeAuthorizationLogin). Falls back to a full-page
 * redirect when the popup is blocked.
 * @returns {Promise<"popup"|"redirect">}
 */
export async function startAuthorizationLogin({ popup = false } = {}) {
  const cfg = await getAuthConfig();
  const state = randomUrlSafe(24);
  const verifier = randomUrlSafe(48);
  sessionStorage.setItem(PKCE_STORE_KEY, JSON.stringify({ state, verifier }));
  const params = new URLSearchParams({
    client_id: WEB_CLIENT_ID,
    response_type: "code",
    redirect_uri: webRedirectUri(),
    scope: scopeString(cfg),
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: "S256",
  });
  const base = await authBaseUrl();
  const url = `${base}/auth?${params.toString()}`;
  if (popup) {
    // Center the popup on the parent window.
    const width = 520;
    const height = 680;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    const win = window.open(
      url, "appmesh-login", `width=${width},height=${height},left=${left},top=${top}`
    );
    if (win) return "popup";
  }
  window.location.assign(url);
  return "redirect";
}

/**
 * Finish the authorization-code flow when the SPA lands on
 * /oauth/callback?code=... (hash router never sees that path itself).
 * In a popup (opened by startAuthorizationLogin) the code is relayed to the
 * opener window, which owns the PKCE verifier and performs the exchange.
 * @returns {Promise<boolean|"relayed">} true when a callback was consumed
 */
export async function completeAuthorizationLogin() {
  const query = new URLSearchParams(window.location.search);
  const code = query.get("code");
  if (!code) return false;
  const state = query.get("state");

  if (window.opener) {
    // Popup callback: hand the code to the opening window and close.
    window.opener.postMessage({ type: "appmesh-oauth", code, state }, window.location.origin);
    window.close();
    return "relayed";
  }

  // Strip ?code=... before the router takes over.
  window.history.replaceState({}, "", window.location.pathname);
  await completeAuthorizationWithCode(code, state);
  return true;
}

/**
 * Exchange an authorization code for tokens using the PKCE verifier stored in
 * this window's session (the same-tab flow and the popup-opener flow).
 */
export async function completeAuthorizationWithCode(code, state) {
  const saved = JSON.parse(sessionStorage.getItem(PKCE_STORE_KEY) || "null");
  sessionStorage.removeItem(PKCE_STORE_KEY);
  if (!saved || saved.state !== state) {
    throw new Error("Login state mismatch, please retry");
  }
  const form = {
    grant_type: "authorization_code",
    code,
    redirect_uri: webRedirectUri(),
    code_verifier: saved.verifier,
    client_id: WEB_CLIENT_ID,
  };
  await installTokens(await tokenRequest(form), WEB_CLIENT_ID);
}

/**
 * Refresh the access token at Dex. Concurrent callers share one request.
 * @returns {Promise<string|null>} new access token, or null when impossible/failed
 */
export function refreshSession() {
  if (refreshPromise) return refreshPromise;
  if (!tokens?.refresh_token) return Promise.resolve(null);
  refreshPromise = (async () => {
    try {
      const cfg = await getAuthConfig();
      const form = {
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
        client_id: tokens.client_id || cfg.public_client_id,
        scope: scopeString(cfg),
      };
      return installTokens(await tokenRequest(form), tokens.client_id || cfg.public_client_id);
    } catch (error) {
      console.warn("Token refresh failed:", error?.message || error);
      clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/**
 * Token for request/payload use: refresh proactively when close to expiry.
 * @returns {Promise<string|null>}
 */
export async function ensureFreshToken() {
  if (!tokenNearExpiry()) return tokens.access_token;
  return (await refreshSession()) || tokens?.access_token || null;
}

/**
 * Principal overlay id, mirroring Principal::stableId (sha256 of
 * issuer + NUL + subject, hex-encoded, "oidc:"-prefixed). Needed to create a
 * new overlay: the backend requires principal_id == stableId(issuer, subject).
 */
export async function computePrincipalId(issuer, subject) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${issuer}\0${subject}`)
  );
  return (
    "oidc:" +
    Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
