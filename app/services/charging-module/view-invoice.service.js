'use strict'

/**
 * Connects with the Charging Module to view an invoice
 * @module ChargingModuleViewInvoiceService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Sends a request to the Charging Module to view an invoice and returns the result
 *
 * @param {String} billingBatchId The Charging Module UUID of the bill run
 * @param {String} invoiceId The Charging Module UUID of the invoice
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the bill run creation request was successful
 * @returns {Object} result.response Details of the created bill run if successful; or the error response if not
*/
async function go (billingBatchId, invoiceId) {
  const path = `v3/wrls/bill-runs/${billingBatchId}/invoices/${invoiceId}`
  const result = await ChargingModuleRequestLib.get(path)

  return result
}

module.exports = {
  go
}
