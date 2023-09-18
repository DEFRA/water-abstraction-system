'use strict'

/**
 * Connects with the Charging Module to reissue a bill
 * @module ReissueBillService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Sends a request to the Charging Module rebill endpoint to reissue an bill (known as invoice in the CHA)
 *
 * This is used aspart of the reissuing process which is a step in the supplementary billing process.
 *
 * @param {String} billRunId The Charging Module UUID of the bill run the new bills will be assigned to
 * @param {String} billId The Charging Module UUID of the bill to be reissued
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response CM response if the request was successful; or the error response if it wasn't
*/
async function go (billRunId, billId) {
  const path = `v3/wrls/bill-runs/${billRunId}/invoices/${billId}/rebill`
  const result = await ChargingModuleRequestLib.patch(path)

  return result
}

module.exports = {
  go
}
