'use strict'

/**
 * Connects with the Charging Module to send a bill run
 * @module ChargingModuleSendBillRunService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Approve then send a bill run in the Charging Module API
 *
 * Our service does in one step what the CHA does in two; approve the bill run then 'send' it. Approving a CHA bill run
 * doesn't actually do anything. It just changes the state to `approved` which the bill run has to be in before the bill
 * run can be sent.
 *
 * Sending a bill run is the final step. Once sent a bill run cannot be changed or deleted. Sending involves the CHA
 * generating a bill number for every bill in the bill run. It then generates a transaction reference for the bill run
 * itself. This reference is used to name the transaction import file which the CHA also generates at this time. This
 * is the file that will make it's way to SOP and be used to generate the invoice and credit notes that customers
 * receive.
 *
 * For small bill runs the process is near instantaneous. Larger bill runs however it can take a number of seconds.
 * Because of this when the request is first made the CHA switches the bill run's status to `sending`. Only when the
 * process is complete does the status get set to `sent`.
 *
 * It's this we are waiting for because then we can extract the generated bill numbers and transaction file reference
 * and apply them to our bill run records.
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/SendBillRun | CHA API docs} for more
 * details
 * @param {string} billRunId - UUID of the charging module API bill run to send
 *
 * @returns {Promise<Object>} The result of the request; whether it succeeded and the response or error returned
 */
async function go (billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}/generate`
  const result = await ChargingModuleRequestLib.patch(path)

  return result
}

module.exports = {
  go
}
