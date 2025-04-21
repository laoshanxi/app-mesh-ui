import { AppMeshClient } from "appmesh";
import { Message } from "element-ui";
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
      const currentPath = router.currentRoute.path;
      if (!currentPath.startsWith("/login")) {
        const redirectParam = encodeURIComponent(router.currentRoute.fullPath);
        router.push(`/login?redirect=${redirectParam}`);
      }
    }

    // Display error message
    Message({
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
}
