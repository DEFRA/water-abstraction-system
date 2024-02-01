'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module PrepareLicenceReturnsService
 */

async function go (returnLogs) {
  const uniqueReturnLogs = _dedupeReturnLogs(returnLogs)
  const { matchedReturns, unmatchedReturns } = _splitReturns(uniqueReturnLogs)
  const chargePeriods = _fetchChargePeriods(returnLogs)

  return { matchedReturns, unmatchedReturns, chargePeriods }
}

function _dedupeReturnLogs (returnLogs) {
  const uniqueIds = []
  const uniqueReturnLogs = []

  returnLogs.forEach(returnLog => {
    const id = returnLog.reviewReturnResultId

    if (!uniqueIds.includes(id)) {
      uniqueIds.push(id)
      uniqueReturnLogs.push(returnLog)
    }
  })

  return uniqueReturnLogs
}

function _fetchChargePeriods (returnLogs) {
  const chargePeriods = []
  const chargeVersionIds = []

  for (const returnLog of returnLogs) {
    const id = returnLog.chargeVersionId
    if (!chargeVersionIds.includes(id)) {
      chargePeriods.push({ startDate: returnLog.chargePeriodStartDate, endDate: returnLog.chargePeriodEndDate })
      chargeVersionIds.push(id)
    }
  }

  return chargePeriods
}

function _splitReturns (returnLogs) {
  const matchedReturns = []
  const unmatchedReturns = []

  for (const returnLog of returnLogs) {
    if (returnLog.reviewChargeElementResultId === null) {
      unmatchedReturns.push(returnLog)
    } else {
      matchedReturns.push(returnLog)
    }
  }

  return { matchedReturns, unmatchedReturns }
}

module.exports = {
  go
}
