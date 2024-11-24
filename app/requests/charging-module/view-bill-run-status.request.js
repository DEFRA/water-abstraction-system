'use strict'

/**
 * Sends a request to the Charging Module to view a bill run's status and returns the result
 * @module ViewBillRunStatusRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Sends a request to the Charging Module to view a bill run's status and returns the result
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/ViewBillRunStatus | API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the Charging Module API bill run to view the status of
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}/status`

  return ChargingModuleRequest.get(path)
}

module.exports = {
  send
}
