'use strict'

/**
 * Processes a new billing batch
 * @module InitiateBillingBatchService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Creates the invoices and transactions in both WRLS and the Charging Module API
 *
 * TODO: Currently a placeholder service. Proper implementation is coming
 *
 * @param {module:BillingBatchModel} billingBatch The newly created bill batch we need to process
 * @param {Object} billingPeriod an object representing the financial year the transaction is for
 */
async function go (billingBatch, billingPeriod) {
  // TODO: Remove this call. We'e just using this to demonstrate that we can make asynchronous calls and perform
  // actions in here all whilst the InitiateBillingBatchService (which calls this service) has moved on and responded
  // to the original request
  const result = await ChargingModuleRequestLib.get('status')
  console.log(result, billingBatch, billingPeriod)
}

module.exports = {
  go
}
