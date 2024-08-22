'use strict'

/**
 * Connects with the Charging Module to send a bill run
 * @module ChargingModuleSendBillRunRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')
const ExpandedError = require('../../errors/expanded.error.js')
const WaitForStatusRequest = require('./wait-for-status.request.js')

/**
 * Approve then send a bill run in the Charging Module API
 *
 * Our service does in one step what the CHA does in two; approve the bill run then 'send' it. Approving a CHA bill run
 * doesn't actually do anything. It just changes the state to `approved` which the bill run has to be in before the bill
 * run can be sent.
 *
 * Sending a bill run is the final step. Once sent a bill run cannot be changed or deleted. Sending involves the CHA
 * generating a transaction reference for every bill in the bill run. It then generates a transaction reference for the
 * bill run itself. This reference is used to name the transaction import file which the CHA also generates at this
 * time. This is the file that will make it's way to SOP and be used to generate the invoice and credit notes that
 * customers receive.
 *
 * For small bill runs the process is near instantaneous. Larger bill runs however it can take a number of seconds.
 * Because of this when the request is first made the CHA switches the bill run's status to `pending`. Only when the
 * process is complete does the status get set to `billed` or `billing_not_required`.
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/SendBillRun | CHA API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the charging module API bill run to send
 *
 * @returns {Promise<object>} the promise returned is not intended to resolve to any particular value
 */
async function send (billRunId) {
  await _approve(billRunId)
  await _send(billRunId)

  return _waitForSent(billRunId)
}

async function _approve (billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}/approve`
  const result = await ChargingModuleRequest.patch(path)

  if (!result.succeeded) {
    const error = new ExpandedError(
      'Charging Module approve request failed',
      { billRunExternalId: billRunId, responseBody: result.response.body }
    )

    throw error
  }
}

async function _send (billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}/send`
  const result = await ChargingModuleRequest.patch(path)

  if (!result.succeeded) {
    const error = new ExpandedError(
      'Charging Module send request failed',
      { billRunExternalId: billRunId, responseBody: result.response.body }
    )

    throw error
  }
}

async function _waitForSent (billRunId) {
  const result = await WaitForStatusRequest.send(billRunId, ['billed', 'billing_not_required'])

  if (!result.succeeded) {
    const error = new ExpandedError(
      'Charging Module wait request failed',
      { billRunExternalId: billRunId, attempts: result.attempts, responseBody: result.response.body }
    )

    throw error
  }

  return result
}

module.exports = {
  send
}
