'use strict'

/**
 * Connects with the Charging Module to delete a new bill run
 * @module ChargingModuleDeleteBillRunService
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Delete a bill run in the Charging Module API
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/DeleteBillRun | CHA API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the Charging Module API bill run to delete
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}`

  return ChargingModuleRequest.delete(path)
}

module.exports = {
  send
}
