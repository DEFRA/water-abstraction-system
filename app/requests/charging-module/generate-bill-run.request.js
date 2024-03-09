'use strict'

/**
 * Connects with the Charging Module to generate a bill run
 * @module GenerateBillRunRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Delete a bill run in the Charging Module API
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/DeleteBillRun | CHA API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the Charging Module API bill run to generate
 *
 * @returns {Promise<Object>} The result of the request; whether it succeeded and the response or error returned
 */
async function go (billingRunId) {
  const path = `v3/wrls/bill-runs/${billingRunId}/generate`
  const result = await ChargingModuleRequest.patch(path)

  return result
}

module.exports = {
  go
}
