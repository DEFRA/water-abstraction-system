'use strict'

/**
 * Cancels the bill run by removing all data relating to it from the database
 * @module CancelBillRunConfirmationService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 *
 * @param {string} id The UUID of the bill run to cancel
 *
 * @returns {Object} an object representing the `pageData` needed by the cancel bill run template. It contains details
 * of the bill run.
 */
async function go (id, billRunBatchType, chargingModuleBillRunId) {
  if (billRunBatchType === 'two_part_tariff') {
    _deleteChargingModuleBillRun(chargingModuleBillRunId)
  }
}

async function _deleteChargingModuleBillRun (chargingModuleBillRunId) {
  const result = await ChargingModuleRequestLib.delete(`v3/wrls/bill-runs/${chargingModuleBillRunId}`)

  if (!result.succeeded) {
    global.GlobalNotifier.omg(`Failed to delete bill run from Charging Module. ${result.response.body.message}`)
  }
}

module.exports = {
  go
}
