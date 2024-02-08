'use strict'

/**
 * Connects with the Charging Module to view a bill
 * @module ChargingModuleViewBillService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Sends a request to the Charging Module to view an invoice and returns the result
 *
 * @param {String} billRunId The Charging Module UUID of the bill run
 * @param {String} billId The Charging Module UUID of the bill
 *
 * @returns {Promise<Object>} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response CM response if the request was successful; or the error response if it wasn't
*/
async function go (billRunId, billId) {
  const path = `v3/wrls/bill-runs/${billRunId}/invoices/${billId}`
  const result = await ChargingModuleRequestLib.get(path)

  return result
}

module.exports = {
  go
}
