import { AppMeshClient } from 'appmesh'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'
import { HttpStatus } from './constants'
import store from '@/store'
import router from '@/router'

const INSTANCE_KEY = '__APP_MESH_CLIENT__';

/**
 * @class VueAppMeshClient
 */
export class VueAppMeshClient extends AppMeshClient {
  constructor(options = {}) {
    super(options.baseURL, options.sslConfig, options.jwtToken)
    this.messageConfig = {
      duration: options.messageDuration || 3000,
      showClose: true
    }
  }

  _handleError(error) {
    const baseError = super._handleError(error)

    if (baseError.statusCode === HttpStatus.UNAUTHORIZED) {
      store.dispatch('user/logout').then(res => {
        router.push("/login");
      }, res => { });
    }

    if (baseError.statusCode !== HttpStatus.PRECONDITION_REQUIRED) {
      let message = baseError.message;

      if (typeof message === 'object') {
        message = message.message || JSON.stringify(message, null, 2);
      } else if (typeof message === 'string') {
        try {
          const parsed = JSON.parse(message);
          message = parsed.message || message;
        } catch (e) { }
      }

      Message({ message, type: 'error', duration: 5 * 1000 });
    }

    return baseError
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
