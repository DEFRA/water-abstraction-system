/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing period
 * @module MatchAndAllocateService
 */

const AllocateReturnsToChargeElementService = require('./allocate-returns-to-charge-element.service.js')
const FetchLicencesService = require('./fetch-licences.service.js')
const MatchReturnsToChargeElementService = require('./match-returns-to-charge-element.service.js')
const PrepareChargeVersionService = require('./prepare-charge-version.service.js')
const PrepareReturnLogsService = require('./prepare-return-logs.service.js')
const PersistAllocatedLicenceToResultsService = require('./persist-allocated-licence-to-results.service.js')

/**
 * Performs the two-part tariff matching and allocating
 *
 * This function initiates the processing of matching and allocating by fetching licenses within the specified region
 * and billing period. Each license undergoes individual processing, including fetching and preparing return logs,
 * charge versions, and charge references. The allocated quantity for each charge reference is set to 0, and matching
 * return logs are allocated to the corresponding charge elements.
 *
 * After processing each license, the results are persisted using PersistAllocatedLicenceToResultsService.
 *
 * @param {module:BillRunModel} billRun - The bill run object containing billing information
 * @param {Object} billingPeriod - A single billing period containing a `startDate` and `endDate`
 *
 * @returns {Boolean} - True if there are any licences matched to returns, false otherwise
 */
async function go (billRun, billingPeriod) {
  const licences = await FetchLicencesService.go(billRun.regionId, billingPeriod)

  if (licences.length > 0) {
    await _process(licences, billingPeriod, billRun)
  }

  return licences.length > 0
}

async function _process (licences, billingPeriod, billRun) {
  for (const licence of licences) {
    await PrepareReturnLogsService.go(licence, billingPeriod)

    const { chargeVersions, returnLogs } = licence
    chargeVersions.forEach((chargeVersion) => {
      PrepareChargeVersionService.go(chargeVersion, billingPeriod)

      const { chargeReferences } = chargeVersion
      chargeReferences.forEach((chargeReference) => {
        chargeReference.allocatedQuantity = 0

        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          const matchingReturns = MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

          if (matchingReturns.length > 0) {
            AllocateReturnsToChargeElementService.go(
              chargeElement,
              matchingReturns,
              chargeVersion.chargePeriod,
              chargeReference
            )
          }
        })
      })
    })

    await PersistAllocatedLicenceToResultsService.go(billRun.id, licence)
  }
}

module.exports = {
  go
}
