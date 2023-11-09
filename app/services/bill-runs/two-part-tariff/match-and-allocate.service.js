'use strict'

/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing periods
 * @module MatchAndAllocateService
 */

const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')

/**
 * Functionality not yet implemented
 */
async function go (billRun, billingPeriods, licenceId) {
  const startTime = process.hrtime.bigint()

  _calculateAndLogTime(startTime, id, type)

  const chargeVersions = FetchChargeVersionsService.go(billRun.regionId, billingPeriods[0], licenceId)
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
