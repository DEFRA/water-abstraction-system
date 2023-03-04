'use strict'

/**
 * Connects with the Charging Module to generate a bill run
 * @module ChargingModuleGenerateBillRunService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

async function go (billingRunId) {
  const path = `v3/wrls/bill-runs/${billingRunId}/generate`
  const result = await ChargingModuleRequestLib.patch(path)

  return result
}

module.exports = {
  go
}
