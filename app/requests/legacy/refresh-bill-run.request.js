'use strict'

/**
 * Connects with the water-abstraction-service to refresh a bill run
 * @module RefreshBillRunRequest
 */

const LegacyRequest = require('../legacy.request.js')

/**
 * Send a request to the legacy water-abstraction-service to refresh a bill run
 *
 * After the Charging Module API has
 * {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/GenerateBillRun | generated} a bill run we
 * need to update the data on our side with the calculated bill totals plus any additional transactions the CHA has
 * deemed necessary.
 *
 * This is handled by the legacy service so we need to send a request in order to start the process.
 *
 * @param {string} billRunId - UUID of the bill run to refresh
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(billRunId) {
  const path = `billing/batches/${billRunId}/refresh`

  return LegacyRequest.post('water', path)
}

module.exports = {
  send
}
