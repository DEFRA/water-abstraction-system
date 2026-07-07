/**
 * View the health of Charging Module service
 * @module ViewHealthRequest
 */

import ChargingModuleRequest from '../charging-module.request.js'

/**
 * View the health of Charging Module service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  const path = 'status'

  return ChargingModuleRequest.get(path)
}

export default {
  send
}
