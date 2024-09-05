'use strict'

/**
 * Connects with the Charging Module to create a new transaction
 * @module CreateTransactionRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Sends a request to the Charging Module to create a transaction and returns the result.
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/AddBillRunTransaction | API docs} for
 * more details
 *
 * @param {string} billRunId - UUID of the Charging Module API bill run the new bills will be assigned to
 * @param {object} transactionData - The transaction details to be sent in the body of the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send (billRunId, transactionData) {
  const path = `v3/wrls/bill-runs/${billRunId}/transactions`

  return ChargingModuleRequest.post(path, transactionData)
}

module.exports = {
  send
}
