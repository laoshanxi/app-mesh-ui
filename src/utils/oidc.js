import axios from "axios";

// OIDC/OAuth layer for the Dex-only backend: tokens come from Dex (re-exposed
// same-origin under `/auth/*`), live in sessionStorage, and are fed to the SDK via set_bearer_token().

const TOKEN_STORE_KEY = "appmesh_oidc";
const PKCE_STORE_KEY = "appmesh_pkce";
const EXPIRY_SKEW_MS = 30 * 1000;

// Pre-registered Dex browser client (auth-code + PKCE); password grant uses public_client_id from auth/config.
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

/** Engine's public OAuth/OIDC config (unauthenticated endpoint). */
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

/** Browser-reachable auth base: the loopback issuer re-exposed same-origin under the issuer path. */
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
    // Dex rotates refresh tokens; keep the previous one if omitted.
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

/** Whether a token is stored (API call vs. go to login). */
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
  // auth/config scopes already include the required audience:server:client_id:<audience> scope.
  return (cfg.scopes || ["openid", "profile", "email"]).join(" ");
}

// Built-in password identities are full emails; expand short names like the CLI does.
const BUILTIN_EMAIL_DOMAIN = "appmesh.local";

/** Direct password grant against Dex (builtin auth mode only). */
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

// ---- Authorization-code + PKCE (client `appmesh-web`) ----

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

/**
 * redirect_uri is always the `browser_entry` origin + /oauth/callback (path prefix
 * dropped), never this window's origin — one Dex registration covers every UI address.
 */
export function webRedirectUri(cfg) {
  if (cfg?.browser_entry) {
    try {
      const url = new URL(cfg.browser_entry);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return `${url.origin}/oauth/callback`;
      }
    } catch {
      // Unusable entry value — same-origin fallback.
    }
  }
  return `${window.location.origin}/oauth/callback`;
}

/** Front-channel authorize base: `browser_entry` origin + issuer path (same-origin fallback). */
function authorizeBaseUrl(cfg) {
  const issuerPath = new URL(cfg.issuer).pathname.replace(/\/+$/, "");
  if (cfg?.browser_entry) {
    try {
      const url = new URL(cfg.browser_entry);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return `${url.origin}${issuerPath}`;
      }
    } catch {
      // Unusable entry value — same-origin fallback.
    }
  }
  return `${window.location.origin}${issuerPath}`;
}

// `state` = base64url(JSON{ o: UI origin, s: CSRF nonce }); the entry relay sends the code to `<o>/oauth/callback`.
function encodeStateParam(origin, nonce) {
  return btoa(JSON.stringify({ o: origin, s: nonce }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeStateParam(state) {
  try {
    const decoded = JSON.parse(atob(String(state).replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded?.o === "string" && typeof decoded?.s === "string" ? decoded : null;
  } catch {
    return null;
  }
}

/** Start the auth-code flow; a popup relays the code via postMessage, else full-page redirect. */
export async function startAuthorizationLogin({ popup = false } = {}) {
  const cfg = await getAuthConfig();
  const verifier = randomUrlSafe(48);
  const state = encodeStateParam(window.location.origin, randomUrlSafe(24));
  sessionStorage.setItem(PKCE_STORE_KEY, JSON.stringify({ state, verifier }));
  const params = new URLSearchParams({
    client_id: WEB_CLIENT_ID,
    response_type: "code",
    redirect_uri: webRedirectUri(cfg),
    scope: scopeString(cfg),
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: "S256",
  });
  const base = authorizeBaseUrl(cfg);
  const url = `${base}/auth?${params.toString()}`;
  if (popup) {
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

// http(s)-only check for relay targets decoded from the OAuth state.
function isHttpOrigin(value) {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Finish the flow on /oauth/callback?code&state (direct or entry-relayed); a popup hands the code to the opener. */
export async function completeAuthorizationLogin() {
  const query = new URLSearchParams(window.location.search);
  const code = query.get("code");
  if (!code) return false;
  const state = query.get("state");
  const origin = decodeStateParam(state)?.o;

  // Security: `o` in state is attacker-controllable — only the registered browser entry
  // may relay a code to a foreign origin; any other foreign `o` is an open redirect (DOM-XSS).
  const cfg = await getAuthConfig();
  const entryOrigin = new URL(webRedirectUri(cfg)).origin;
  const relayTarget =
    origin &&
    origin !== window.location.origin &&
    isHttpOrigin(origin) &&
    window.location.origin === entryOrigin
      ? origin
      : null;

  if (window.opener) {
    // Popup: hand the code to the opener (relayTarget when the entry is another origin).
    window.opener.postMessage(
      { type: "appmesh-oauth", code, state },
      relayTarget || window.location.origin
    );
    window.close();
    return "relayed";
  }

  // Redirect entry differs from the UI origin: relay the code there (like the static relay pages).
  if (relayTarget) {
    window.location.replace(`${relayTarget}/oauth/callback${window.location.search}`);
    return "relayed";
  }

  // Strip ?code=... before the router takes over.
  window.history.replaceState({}, "", window.location.pathname);
  await completeAuthorizationWithCode(code, state);
  return true;
}

/**
 * Exchange a code with this window's stored PKCE verifier; the state must match the
 * flow-start value — it verifies the nonce and binds the code to this verifier.
 */
export async function completeAuthorizationWithCode(code, state) {
  const saved = JSON.parse(sessionStorage.getItem(PKCE_STORE_KEY) || "null");
  sessionStorage.removeItem(PKCE_STORE_KEY);
  if (!saved || saved.state !== state || !decodeStateParam(state)) {
    throw new Error("Login state mismatch, please retry");
  }
  const cfg = await getAuthConfig();
  const form = {
    grant_type: "authorization_code",
    code,
    redirect_uri: webRedirectUri(cfg),
    code_verifier: saved.verifier,
    client_id: WEB_CLIENT_ID,
  };
  await installTokens(await tokenRequest(form), WEB_CLIENT_ID);
}

/** Refresh at Dex; concurrent callers share one request. */
export function refreshSession() {
  if (refreshPromise) return refreshPromise;
  if (!tokens?.refresh_token) return Promise.resolve(null);
  refreshPromise = (async () => {
    try {
      // snapshot: a concurrent logout (clearSession) can null `tokens` while we await
      const saved = tokens;
      const cfg = await getAuthConfig();
      if (!saved?.refresh_token) return null;
      const form = {
        grant_type: "refresh_token",
        refresh_token: saved.refresh_token,
        client_id: saved.client_id || cfg.public_client_id,
        scope: scopeString(cfg),
      };
      return installTokens(await tokenRequest(form), saved.client_id || cfg.public_client_id);
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

/** Request-ready token; refreshes proactively near expiry. */
export async function ensureFreshToken() {
  if (!tokenNearExpiry()) return tokens.access_token;
  return (await refreshSession()) || tokens?.access_token || null;
}

/** "oidc:" + sha256(issuer + NUL + subject) hex, mirroring Principal::stableId (backend requires equality). */
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
