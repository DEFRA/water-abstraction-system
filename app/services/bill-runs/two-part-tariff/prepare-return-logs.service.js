'use strict'

/**
 * Stuff
 * @module PrepareReturnLogsService
 */

const DetermineAbstractionPeriodService = require('../determine-abstraction-periods.service.js')
const FetchReturnLogsForLicenceService = require('./fetch-return-logs-for-licence.service.js')
const { periodsOverlap } = require('../../../lib/general.lib.js')

async function go (licence, billingPeriod) {
  await _prepareReturnLogs(licence, billingPeriod)
}

function _abstractionOutsidePeriod (returnAbstractionPeriods, returnLine) {
  const { startDate, endDate } = returnLine

  return !periodsOverlap(returnAbstractionPeriods, [{ startDate, endDate }])
}

/**
 * Checks a return record for potential issues based on specific criteria and flags it accordingly
 */
function _checkReturnForIssues (returnLog) {
  if (returnLog.nilReturn) {
    return true
  }

  if (returnLog.underQuery) {
    return true
  }

  if (returnLog.status !== 'completed') {
    return true
  }

  if (returnLog.returnSubmissions.length === 0 || returnLog.returnSubmissions[0].returnSubmissionLines.length === 0) {
    return true
  }

  return false
}

async function _prepareReturnLogs (licence, billingPeriod) {
  licence.returnLogs = await FetchReturnLogsForLicenceService.go(licence.licenceRef, billingPeriod)

  _prepReturnsForMatching(licence.returnLogs, billingPeriod)
}

function _prepReturnsForMatching (returnLogs, billingPeriod) {
  returnLogs.forEach((returnLog) => {
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth, returnSubmissions } = returnLog
    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    let quantity = 0
    let abstractionOutsidePeriod = false

    returnSubmissions[0]?.returnSubmissionLines.forEach((returnSubmissionLine) => {
      if (!abstractionOutsidePeriod) {
        abstractionOutsidePeriod = _abstractionOutsidePeriod(abstractionPeriods, returnSubmissionLine)
      }
      returnSubmissionLine.unallocated = returnSubmissionLine.quantity / 1000
      quantity += returnSubmissionLine.unallocated
    })

    returnLog.nilReturn = returnSubmissions[0]?.nilReturn ?? false
    returnLog.quantity = quantity
    returnLog.allocatedQuantity = 0
    returnLog.abstractionPeriods = abstractionPeriods
    returnLog.abstractionOutsidePeriod = abstractionOutsidePeriod
    returnLog.matched = false

    returnLog.issues = (_checkReturnForIssues(returnLog))
  })
}

module.exports = {
  go
}
