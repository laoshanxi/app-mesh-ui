import { AppMeshClient } from "appmesh";
import { ElMessage } from "element-plus";
import { HttpStatus } from "./constants";
import { getAccessToken, hasSession, refreshSession, ensureFreshToken } from "./oidc";
import store from "@/store";
import router from "@/router";

/** Vue-specific AppMeshClient with UI integration. */
export class VueAppMeshClient extends AppMeshClient {
  constructor(options = {}) {
    super(options.baseURL, options.sslConfig);
  }

  /**
   * Single interception point for every API call:
   * 1. refresh a near-expiry token BEFORE the request goes out (no 401 at all);
   * 2. on a 401, silently refresh and retry once — the user only sees an error
   *    when the refresh fails or the fresh token is still rejected.
   */
  async _request(method, path, body = null, options = {}) {
    if (hasSession()) {
      const token = await ensureFreshToken();
      if (token) this.set_bearer_token(token);
    }

    try {
      return await super._request(method, path, body, options);
    } catch (error) {
      if (error?.statusCode !== HttpStatus.UNAUTHORIZED || !hasSession()) throw error;

      // Bearer rejected: one silent refresh + retry; report only if that fails.
      const token = await refreshSession();
      if (!token) this._sessionExpired(error);
      this.set_bearer_token(token);

      try {
        return await super._request(method, path, body, options);
      } catch (retryError) {
        if (retryError?.statusCode === HttpStatus.UNAUTHORIZED) {
          this._sessionExpired(retryError);
        }
        throw retryError;
      }
    }
  }

  /** Refresh failed or a fresh token was still rejected: the session is dead. */
  _sessionExpired(error) {
    ElMessage({
      message: "Session expired, please sign in again",
      type: "error",
      duration: 5000,
      grouping: true,
    });
    forceRelogin();
    throw error;
  }

  onError(error) {
    if (error?.statusCode === HttpStatus.UNAUTHORIZED) {
      // 401 = bearer missing/expired. With a session, _request owns the silent
      // refresh + retry, so stay quiet here; without one, go to login.
      if (hasSession()) return error;
      forceRelogin();
    }
    // 403/503 keep the session: the token is valid, only the action is not allowed.

    // Grouped toast: poll loops can fire the same error repeatedly.
    ElMessage({
      message: error?.message || "Unknown error occurred",
      type: "error",
      duration: 5000,
      grouping: true,
    });

    return error;
  }
}

/** Drop the local session and go to login (loop-guarded). */
export function forceRelogin() {
  store.dispatch("user/logout").catch((err) => console.error("Logout error:", err));
  const currentPath = router.currentRoute.value.path;
  if (!currentPath.startsWith("/login")) {
    const redirectParam = encodeURIComponent(router.currentRoute.value.fullPath);
    router.push(`/login?redirect=${redirectParam}`);
  }
}

const INSTANCE_KEY = "__APP_MESH_CLIENT__";

/** Client with the current Dex bearer re-attached per call (refresh picked up without rebuild). */
export function getClient() {
  if (!window[INSTANCE_KEY]) {
    window[INSTANCE_KEY] = new VueAppMeshClient();
  }

  const client = window[INSTANCE_KEY];
  // Always resync from the store: a cleared setting must clear the client (login clears forwarding).
  client.forwardingHost = store.getters?.forwarding || null;

  const token = getAccessToken();
  if (token) {
    client.set_bearer_token(token);
  } else {
    client.clear_bearer_token();
  }

  return client;
}

/** Clear the client instance. */
export function clearClient() {
  window[INSTANCE_KEY] = null;
}

/** Task-payload token: the engine authenticates from `token` INSIDE the payload; same Dex bearer token. */
export function getWorkflowToken() {
  return ensureFreshToken();
}
