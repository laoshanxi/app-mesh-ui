import { AppMeshClient } from 'appmesh'
import { Message } from 'element-ui'
import { getToken, removeToken } from '@/utils/auth'
import { HttpStatus } from './constants'
import store from '@/store'
import router from '@/router'

const INSTANCE_KEY = '__APP_MESH_CLIENT__';

/**
 * Vue-specific implementation of AppMeshClient with UI integration
 */
export class VueAppMeshClient extends AppMeshClient {
  constructor(options = {}) {
    super(options.baseURL, options.sslConfig, options.jwtToken);
  }

  /**
   * Override error handler to add Vue-specific behavior
   * @protected
   * @param {Error} error - The caught error
   * @returns {AppMeshError} Standardized AppMeshError
   */
  onError(error) {
    // First check if error is a valid object with statusCode
    if (error && typeof error === 'object' && 'statusCode' in error) {
      if (error.statusCode === HttpStatus.UNAUTHORIZED) {
        // Clear token to avoid next token re-use
        this.jwtToken = null;
        removeToken();

        // Logout user and redirect to login page
        store.dispatch('user/logout')
          .catch(logoutError => console.error('Logout error:', logoutError));

        // Check if we're not already on the login page to avoid redirection loops
        if (!router.currentRoute.path.startsWith('/login')) {
          router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.fullPath)}`)
        }
      }
    }

    // Show error message using Element UI
    const message = error.message || 'Unknown error occurred';
    Message({
      message,
      type: 'error',
      duration: 5 * 1000
    });

    return error;
  }
}

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
  const token = store.getters?.token;
  const forwardingHost = store.getters?.forwarding;
  const headers = data?.headers || {};

  if (token && !('Authorization' in headers)) {
    client.jwtToken = getToken();
  }
  if (forwardingHost && !('X-Target-Host' in headers)) {
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
