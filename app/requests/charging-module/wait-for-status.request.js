'use strict'

/**
 * Use to wait for a Charging Module bill run to be in a certain state
 * @module ChargingModuleWaitForStatusRequest
 */

const { setTimeout } = require('node:timers/promises')

const ExpandedError = require('../../errors/expanded.error.js')
const ViewBillRunStatusRequest = require('./view-bill-run-status.request.js')

const billingConfig = require('../../../config/billing.config.js')

/**
 * Wait for a Charging Module bill run to have a specified state
 *
 * Will keep calling the Charging Module API's
 * {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/ViewBillRunStatus | status endpoint} until it
 * returns one of the statuses specified. For example, after requesting a bill run is 'sent' the CHA will set the bill
 * run's state to `pending` until it has finished sending it to SOP. It will then set the state to either `billed` or
 * `billing_not_required`.
 *
 * We need to be able to update the bills and bill run on our side with the transaction references generated by the CHA.
 * So, we have a need to first tell the CHA to 'send' its bill run then wait until it has finished before extracting the
 * new data.
 *
 * This service was created for exactly that purpose. In order not to bombard the CHA we pause between checks (default
 * is 1 second). To prevent the process getting stuck we'll only check so many times (default 120).
 *
 * Either way we return a result which states whether the wait was successful, what the last status returned was, and
 * how many attempts it took.
 *
 * ```javascript
 * {
 *   succeeded: true,
 *   status: 'billed',
 *   attempts: 7
 * }
 * ```
 *
 * @param {string} billRunId - UUID of bill run being sent
 * @param {string[]} statusesToWaitFor - Array of statuses to wait for, for example, `['billed', 'billing_not_required]`
 * @param {number} [maximumAttempts] - Number of times to check the status before giving up. Defaults to 120
 *
 * @returns {Promise<object>} returns the results of the wait
 */
async function send(billRunId, statusesToWaitFor, maximumAttempts = 120) {
  let attempts = 0
  let status

  for (let i = 1; i <= maximumAttempts; i++) {
    const result = await ViewBillRunStatusRequest.send(billRunId)

    attempts = i

    if (!result.succeeded) {
      _requestFailed(billRunId, result)
    }

    status = result.response.body.status

    if (statusesToWaitFor.includes(status)) {
      break
    }

    await _pause()
  }

  return {
    succeeded: statusesToWaitFor.includes(status),
    status,
    attempts
  }
}

/**
 * Pause between requests so that we are not bombarding the Charging Module
 *
 * The default is 1 second but we make this configurable mainly to allow us to override the pause in unit tests
 *
 * @private
 */
function _pause() {
  return setTimeout(billingConfig.waitForStatusPauseInMs)
}

function _requestFailed(billRunId, result) {
  const error = new ExpandedError('Charging Module wait for status request failed', {
    billRunExternalId: billRunId,
    responseBody: result.response.body
  })

  throw error
}

module.exports = {
  send
}
