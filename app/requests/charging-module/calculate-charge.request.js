/**
 * Connects with the Charging Module to calculate a standalone charge
 * @module CalculateChargeRequest
 */

import ChargingModuleRequest from '../charging-module.request.js'

/**
 * Sends a request to the Charging Module to calculate a standalone charge and returns the result.
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/calculate/CalculateCharge | API docs} for
 * more details
 *
 * @param {object} transactionData - The transaction details to be sent in the body of the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(transactionData) {
  const path = 'v3/wrls/calculate-charge'

  return ChargingModuleRequest.post(path, transactionData)
}

export {
  send
}
export default {
  send
}
