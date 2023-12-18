'use strict'

/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing periods
 * @module MatchAndAllocateService
 */

const AllocateReturnsToLicenceService = require('./allocate-returns-to-licence.service.js')
const FetchLicencesService = require('./fetch-licences.service.js')
const PrepareLicencesForAllocationService = require('./prepare-licences-for-allocation.service.js')
const TransformAllocatedLicencesToResultsService = require('./transform-allocated-licences-to-results.service.js')

/**
 * Functionality not yet implemented
 */
async function go (billRun, billingPeriods, licenceId) {
  const startTime = process.hrtime.bigint()

  const licences = await FetchLicencesService.go(billRun.regionId, billingPeriods[0], licenceId)

  await PrepareLicencesForAllocationService.go(licences, billingPeriods[0])

  AllocateReturnsToLicenceService.go(licences, billRun.billingBatchId)

  const reviewResults = TransformAllocatedLicencesToResultsService.go(billRun, licences)
  // Temporaily put a console log to shut up the linting
  console.log(reviewResults)

  _calculateAndLogTime(startTime)

  return licences
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Two part tariff matching complete', { timeTakenMs })
}

module.exports = {
  go
}
