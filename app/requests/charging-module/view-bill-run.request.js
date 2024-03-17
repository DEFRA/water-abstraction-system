'use strict'

/**
 * Connects with the Charging Module to get a bill run summary
 * @module ChargingModuleViewBillRunRequest
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * View a bill run in the Charging Module API
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/ViewBillRun | CHA API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the charging module API bill run to view
 *
 * @returns {Promise<Object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send (billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}`
  const result = await ChargingModuleRequestLib.get(path)

  return result
}

module.exports = {
  send
}
