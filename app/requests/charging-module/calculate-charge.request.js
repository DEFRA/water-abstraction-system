'use strict'

/**
 * Connects with the Charging Module to calculate a standalone charge
 * @module CalculateChargeRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Sends a request to the Charging Module to calculate a standalone charge and returns the result.
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/AddBillRunTransaction | API docs} for
 * more details
 *
 * @param {Object} transactionData - The transaction details to be sent in the body of the request
 *
 * @returns {Promise<Object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send (transactionData) {
  const path = 'v3/wrls/calculate-charge'

  return ChargingModuleRequest.post(path, transactionData)
}

module.exports = {
  send
}
