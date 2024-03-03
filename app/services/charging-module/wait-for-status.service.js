'use strict'

/**
 * Connects with the Charging Module to send a bill run
 * @module ChargingModuleSendBillRunService
 */

const { setTimeout } = require('node:timers/promises')

const BillRunStatusService = require('./bill-run-status.service.js')
const ExpandedError = require('../../errors/expanded.error.js')

const ONE_SECOND = 1000

async function go (billRunId, statusToWaitFor, maximumAttempts = 120) {
  let attempts = 0
  let status

  //
  do {
    await _pause(attempts)

    const result = await BillRunStatusService.go(billRunId)

    if (!result.succeeded) {
      _requestFailed(billRunId, result)
    }

    status = result.response.body.status
    attempts += 1
  } while (status !== statusToWaitFor || attempts >= maximumAttempts)

  if (status !== statusToWaitFor) {
    _statusNotAchieved(billRunId, statusToWaitFor, status, attempts, maximumAttempts)
  }
}

/**
 * Pause for one second between requests so that we are not bombarding the Charging Module
 */
function _pause (attempts) {
  // If attempts is 0 then this is the first attempt so don't pause
  if (attempts === 0) {
    return
  }

  return setTimeout(ONE_SECOND)
}

function _requestFailed (billRunId, result) {
  const error = new ExpandedError(
    'Charging Module status request failed',
    { billRunExternalId: billRunId, responseBody: result.response.body }
  )

  throw error
}

function _statusNotAchieved (billRunId, statusToWaitFor, status, attempts, maximumAttempts) {
  const error = new ExpandedError(
    'Charging Module wait for status failed',
    { billRunExternalId: billRunId, statusToWaitFor, lastStatus: status, attempts, maximumAttempts }
  )

  throw error
}

module.exports = {
  go
}
