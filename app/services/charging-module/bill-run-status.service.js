'use strict'

/**
 * Sends a request to the Charging Module to view a bill run's status and returns the result
 * @module ChargingModuleBillRunStatusService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Sends a request to the Charging Module to view a bill run's status and returns the result
 *
 * @param {string} billRunId The UUID of the bill run to view the status of. Note that this is the Charging
 * Module's UUID, ie. what we call the "external ID"
 *
 * @returns {Promise<Object>} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response Details of the bill run status if successful; or the error response if not
 */
async function go (billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}/status`
  const result = await ChargingModuleRequestLib.get(path)

  return result
}

module.exports = {
  go
}
