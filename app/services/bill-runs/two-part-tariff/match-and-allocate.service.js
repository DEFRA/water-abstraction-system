/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing periods
 * @module MatchAndAllocateService
 */

const AllocateReturnsToChargeElementService = require('./allocate-returns-to-charge-element.service.js')
const FetchLicencesService = require('./fetch-licences.service.js')
const MatchReturnsToChargeElementService = require('./match-returns-to-charge-element.service.js')
const PrepareChargeVersionService = require('./prepare-charge-version.service.js')
const PrepareReturnLogsService = require('./prepare-return-logs.service.js')
const PersistAllocatedLicenceToResultsService = require('./persist-allocated-licence-to-results.service.js')

/**
 * Functionality not yet implemented
 */
async function go (billRun, billingPeriods, licenceId) {
  const startTime = process.hrtime.bigint()

  const licences = await FetchLicencesService.go(billRun.regionId, billingPeriods[0], licenceId)

  if (licences.length > 0) {
    await _process(licences, billingPeriods, billRun)

    _calculateAndLogTime(startTime)
  }

  return licences
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Two part tariff matching complete', { timeTakenMs })
}

async function _process (licences, billingPeriods, billRun) {
  for (const licence of licences) {
    await PrepareReturnLogsService.go(licence, billingPeriods[0])

    const { chargeVersions, returnLogs } = licence
    chargeVersions.forEach((chargeVersion) => {
      PrepareChargeVersionService.go(chargeVersion, billingPeriods[0])

      const { chargeReferences } = chargeVersion
      chargeReferences.forEach((chargeReference) => {
        chargeReference.allocatedQuantity = 0

        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          const matchingReturns = MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

          if (matchingReturns.length > 0) {
            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargeVersion.chargePeriod, chargeReference)
          }
        })
      })
    })

    await PersistAllocatedLicenceToResultsService.go(billRun.billingBatchId, licence)
  }
}

module.exports = {
  go
}
