import { AppMeshClient } from "appmesh";
import { ElMessage } from "element-plus";
import axios from "axios";
import Cookies from "js-cookie";
import { HttpStatus } from "./constants";
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
    // Handle 401 Unauthorized errors
    if (error?.statusCode === HttpStatus.UNAUTHORIZED) {
      // Logout user and redirect to login page
      store.dispatch("user/logout").catch(err =>
        console.error("Logout error:", err)
      );

      // Prevent redirect loops
      const currentPath = router.currentRoute.value.path;
      if (!currentPath.startsWith("/login")) {
        const redirectParam = encodeURIComponent(router.currentRoute.value.fullPath);
        router.push(`/login?redirect=${redirectParam}`);
      }
    }

    // Display error message
    ElMessage({
      message: error?.message || "Unknown error occurred",
      type: "error",
      duration: 5000,
    });

    return error;
  }
}

const INSTANCE_KEY = "__APP_MESH_CLIENT__";

/**
 * Get the AppMesh client instance
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

  return client;
}

/**
 * Clear the client instance
 */
export function clearClient() {
  window[INSTANCE_KEY] = null;
  workflowToken = null;
}

/**
 * Some daemon task-server apps (notably the Workflow engine) authenticate the caller
 * from a `token` field INSIDE the task payload — not from the HTTP auth cookie. The
 * daemon does not inject it (see RestHandler::apiSendMessage), and the session JWT lives
 * in an HttpOnly cookie that JS cannot read. So we capture an explicit JWT here, the same
 * way the Python/CLI samples do (they pass `_get_access_token()` in the payload).
 *
 * `token/renew` is cookie-authenticated and returns a fresh JWT (`access_token`) in its
 * body. CSRF double-submit requires echoing the readable `appmesh_csrf_token` cookie.
 */
const CSRF_COOKIE_NAME = "appmesh_csrf_token";
let workflowToken = null;
let capturePromise = null; // de-dupes concurrent captures

export function getWorkflowToken() {
  return workflowToken;
}

/**
 * Capture (or refresh) a payload-usable JWT via the cookie-authenticated token/renew
 * endpoint, which returns a fresh `access_token` in its body. Works after login and on a
 * restored session (the auth cookie exists either way). Best-effort: never throws.
 *
 * Concurrent callers share a single in-flight request so a page that fires several workflow
 * actions at once doesn't trigger multiple token/renew calls.
 * @returns {Promise<string|null>}
 */
export function captureWorkflowToken() {
  if (capturePromise) return capturePromise;
  capturePromise = (async () => {
    try {
      const csrf = Cookies.get(CSRF_COOKIE_NAME);
      const res = await axios.post("/appmesh/token/renew", null, {
        withCredentials: true,
        headers: csrf ? { "X-CSRF-Token": csrf } : {},
      });
      workflowToken = res?.data?.access_token || null;
    } catch (error) {
      workflowToken = null;
      // token/renew is a raw axios call (bypasses the SDK's onError). A 401 means the
      // session cookie is invalid/expired -> force re-login, like onError does for 401.
      if (error?.response?.status === HttpStatus.UNAUTHORIZED) {
        store.dispatch("user/logout").catch(() => {});
        const currentPath = router.currentRoute.value.path;
        if (!currentPath.startsWith("/login")) {
          router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
        }
      } else {
        console.warn("captureWorkflowToken failed:", error?.message || error);
      }
    }
    return workflowToken;
  })();
  capturePromise.finally(() => { capturePromise = null; });
  return capturePromise;
}
