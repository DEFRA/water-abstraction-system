'use strict'

/**
 * Connects with the Charging Module to reissue a bill
 * @module ReissueBillRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Sends a request to the Charging Module rebill endpoint to reissue an bill (known as invoice in the CHA)
 *
 * This is used aspart of the reissuing process which is a step in the supplementary billing process.
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/RebillBillRunInvoice | CHA API docs} for
 * more details
 *
 * @param {String} billRunId - UUID of the Charging Module API bill run the new bills will be assigned to
 * @param {String} billId - UUID of the Charging Module the bill to be reissued
 *
 * @returns {Promise<Object>} The result of the request; whether it succeeded and the response or error returned
*/
async function go (billRunId, billId) {
  const path = `v3/wrls/bill-runs/${billRunId}/invoices/${billId}/rebill`
  const result = await ChargingModuleRequest.patch(path)

  return result
}

module.exports = {
  go
}
