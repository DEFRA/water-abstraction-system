'use strict'

/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing periods
 * @module MatchAndAllocateService
 */

/**
 * Functionality not yet implemented
 */
async function go (_billRun, billingPeriods, licenceId) {
  const startTime = process.hrtime.bigint()

  throw new Error(`Two Part Tariff is not yet implemented for Financial Year Ending: ${billingPeriods[0].endDate.getFullYear()}`)

  _calculateAndLogTime(startTime, id, type)


}

function _calculateAndLogTime (startTime, id, type) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg(`Two part tariff ${type} matching complete`, { id, timeTakenMs })
}

module.exports = {
  go
}
