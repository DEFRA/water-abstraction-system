/**
 * View the health of Gotenberg service
 * @module ViewHealthRequest
 */

import BaseRequest from '../base.request.js'

import gotenbergConfig from '../../../config/gotenberg.config.js'

/**
 * View the health of Gotenberg service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  const statusUrl = new URL('/health', gotenbergConfig.url)

  return BaseRequest.get(statusUrl.href, { responseType: 'json' })
}

export {
  send
}
export default {
  send
}
