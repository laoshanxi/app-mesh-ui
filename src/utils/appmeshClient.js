import { AppMeshClient } from "appmesh";
import { ElMessage } from "element-plus";
import { HttpStatus } from "./constants";
import { getAccessToken, hasSession, refreshSession, ensureFreshToken } from "./oidc";
import store from "@/store";
import router from "@/router";

/**
 * Vue-specific implementation of AppMeshClient with UI integration
 */
export class VueAppMeshClient extends AppMeshClient {
  constructor(options = {}) {
    super(options.baseURL, options.sslConfig);
  }

  /**
   * Override error handler to add Vue-specific behavior
   * @protected
   * @param {Error} error - The caught error
   * @returns {Error} The original error
   */
  onError(error) {
    if (error?.statusCode === HttpStatus.UNAUTHORIZED) {
      // 401 = bearer missing/expired: try one silent refresh at Dex. Only when
      // that fails (or there is nothing to refresh) do we force a re-login.
      if (hasSession()) {
        refreshSession().then((token) => {
          if (token) {
            ElMessage({
              message: "Session refreshed, please retry your action",
              type: "info",
              duration: 5000,
            });
          } else {
            forceRelogin();
          }
        });
      } else {
        forceRelogin();
      }
    }
    // 403 (no permission) and 503 (auth service unreachable) keep the session:
    // the token is valid, only the action is not allowed right now.

    // Display error message
    ElMessage({
      message: error?.message || "Unknown error occurred",
      type: "error",
      duration: 5000,
    });

    return error;
  }
}

/**
 * Drop the local session and send the user to the login page (loop-guarded).
 */
export function forceRelogin() {
  store.dispatch("user/logout").catch((err) => console.error("Logout error:", err));
  const currentPath = router.currentRoute.value.path;
  if (!currentPath.startsWith("/login")) {
    const redirectParam = encodeURIComponent(router.currentRoute.value.fullPath);
    router.push(`/login?redirect=${redirectParam}`);
  }
}

const INSTANCE_KEY = "__APP_MESH_CLIENT__";

/**
 * Get the AppMesh client instance with the current Dex bearer attached.
 * The token lives in the OIDC layer (sessionStorage-backed); attaching it here
 * on every call means a refresh is picked up without rebuilding the client.
 * @param {Object} [data] - Optional configuration data
 * @param {Object} [data.headers] - Optional headers
 * @returns {VueAppMeshClient}
 */
export function getClient(data = null) {
  if (!window[INSTANCE_KEY]) {
    window[INSTANCE_KEY] = new VueAppMeshClient();
  }

  const client = window[INSTANCE_KEY];
  const forwardingHost = store.getters?.forwarding;
  const headers = data?.headers || {};

  if (forwardingHost && !("X-Target-Host" in headers)) {
    client.forwardingHost = forwardingHost;
  }

  const token = getAccessToken();
  if (token) {
    client.set_bearer_token(token);
  } else {
    client.clear_bearer_token();
  }

  return client;
}

/**
 * Clear the client instance
 */
export function clearClient() {
  window[INSTANCE_KEY] = null;
}

/**
 * Token for task payloads (e.g. the Workflow engine authenticates the caller
 * from a `token` field INSIDE the run_task payload). The daemon no longer
 * mints/renews tokens (no /appmesh/token/renew): the payload token is the same
 * Dex access token the SDK sends as bearer.
 * @returns {Promise<string|null>}
 */
export function getWorkflowToken() {
  return ensureFreshToken();
}
