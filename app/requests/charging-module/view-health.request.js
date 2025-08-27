'use strict'

/**
 * View the health of Charging Module service
 * @module GenerateReturnFormRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * View the health of Charging Module service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  const path = 'status'

  return ChargingModuleRequest.get(path)
}

module.exports = {
  send
}
