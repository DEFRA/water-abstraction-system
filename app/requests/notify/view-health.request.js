/**
 * View the health of Notify service
 * @module ViewHealthRequest
 */

import NotifyRequest from '../notify.request.js'

/**
 * View the health of Notify service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  return NotifyRequest.get('')
}

export {
  send
}
export default {
  send
}
