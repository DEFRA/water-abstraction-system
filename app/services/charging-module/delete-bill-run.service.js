'use strict'

/**
 * Connects with the Charging Module to delete a new bill run
 * @module ChargingModuleDeleteBillRunService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Delete a bill run in the Charging Module API
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/DeleteBillRun | CHA API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the charging module API bill run to delete
 *
 * @returns {Promise<Object>} The result of the request; whether it succeeded and the response or error returned
 */
async function go (billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}`
  const result = await ChargingModuleRequestLib.delete(path)

  return result
}

module.exports = {
  go
}
