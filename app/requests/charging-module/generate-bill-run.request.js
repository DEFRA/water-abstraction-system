'use strict'

/**
 * Connects with the Charging Module to generate a bill run
 * @module GenerateBillRunRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Generate a bill run in the Charging Module API
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/GenerateBillRun | CHA API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the Charging Module API bill run to generate
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send (billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}/generate`

  return ChargingModuleRequest.patch(path)
}

module.exports = {
  send
}
