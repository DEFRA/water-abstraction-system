/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing period
 * @module MatchAndAllocateService
 */

import AllocateReturnsToChargeElementService from './allocate-returns-to-charge-element.service.js'
import DetermineLicenceIssuesService from './determine-licence-issues.service.js'
import FetchLicencesService from './fetch-licences.service.js'
import MatchReturnsToChargeElementService from './match-returns-to-charge-element.service.js'
import PersistAllocatedLicenceToResultsService from './persist-allocated-licence-to-results.service.js'
import PrepareChargeVersionService from './prepare-charge-version.service.js'
import PrepareReturnLogsService from './prepare-return-logs.service.js'

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
 * @param {module:BillRunModel} billRun - The bill run being processed
 * @param {object} billingPeriod - A single billing period containing a `startDate` and `endDate`
 *
 * @returns {Promise<boolean>} - True if there are any licences matched to returns, else false
 */
async function go(billRun, billingPeriod) {
  const licences = await FetchLicencesService.go(billRun, billingPeriod)

  if (licences.length > 0) {
    await _process(licences, billingPeriod, billRun)
  }

  return licences.length > 0
}

async function _process(licences, billingPeriod, billRun) {
  for (const licence of licences) {
    await PrepareReturnLogsService.go(licence, billingPeriod)

    const { chargeVersions, returnLogs } = licence

    chargeVersions.forEach((chargeVersion) => {
      PrepareChargeVersionService.go(chargeVersion, billingPeriod)

      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        let chargeReferenceMatched = false

        chargeReference.allocatedQuantity = 0

        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          const matchingReturns = MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

          if (matchingReturns.length > 0) {
            chargeReferenceMatched = true

            AllocateReturnsToChargeElementService.go(
              chargeElement,
              matchingReturns,
              chargeVersion.chargePeriod,
              chargeReference
            )
          }
        })

        if (!chargeReferenceMatched) {
          _useAuthorisedVolume(chargeReference)
        }
      })
    })

    DetermineLicenceIssuesService.go(licence)
    await PersistAllocatedLicenceToResultsService.go(billRun.id, licence)
  }
}

function _useAuthorisedVolume(chargeReference) {
  const { chargeElements } = chargeReference

  let availableQuantity = chargeReference.volume
  let totalAllocatedQuantity = 0

  chargeElements.forEach((chargeElement) => {
    let qtyToAllocate

    if (chargeElement.authorisedAnnualQuantity <= availableQuantity) {
      qtyToAllocate = chargeElement.authorisedAnnualQuantity
    } else {
      qtyToAllocate = availableQuantity
    }

    chargeElement.allocatedQuantity = qtyToAllocate
    availableQuantity -= qtyToAllocate
    totalAllocatedQuantity += qtyToAllocate
  })

  chargeReference.allocatedQuantity = totalAllocatedQuantity
}

export default {
  go
}
