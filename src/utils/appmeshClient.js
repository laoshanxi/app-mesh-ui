import { AppMeshClient } from 'appmesh'
import ElementUI from 'element-ui'
import { MessageBox, Message } from 'element-ui'

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

    const message = error.message || 'Error'
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })

    return baseError
  }
}
