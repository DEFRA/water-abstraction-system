'use strict'

/**
 * Connects with the Charging Module to rebill an invoice
 * @module RebillInvoiceService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Sends a request to the Charging Module to rebill an invoice (used when reissuing) and returns the result
 *
 * @param {String} billingBatchId The Charging Module UUID of the bill run the new invoices will be assigned to
 * @param {String} invoiceId The Charging Module UUID of the invoice to be rebilled/reissued
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response CM response if the request was successful; or the error response if it wasn't
*/
async function go (billingBatchId, invoiceId) {
  const path = `v3/wrls/bill-runs/${billingBatchId}/invoices/${invoiceId}/rebill`
  const result = await ChargingModuleRequestLib.patch(path)

  return result
}

module.exports = {
  go
}
