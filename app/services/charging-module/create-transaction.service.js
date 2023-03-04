'use strict'

/**
 * Connects with the Charging Module to create a new transaction
 * @module ChargingModuleCreateTransactionService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

async function go (billingBatchId, transactionData) {
  const path = `v3/wrls/bill-runs/${billingBatchId}/transactions`
  const result = await ChargingModuleRequestLib.post(path, transactionData)

  return result
}

module.exports = {
  go
}
