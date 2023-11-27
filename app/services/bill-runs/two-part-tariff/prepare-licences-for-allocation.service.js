'use strict'

/**
 * Do stuff
 * @module PrepareLicencesForAllocationService
 */

const DetermineAbstractionPeriodService = require('../../check/determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const FetchReturnsForLicenceService = require('./fetch-returns-for-licence.service.js')
const { periodsOverlap } = require('../../../lib/general.lib.js')

async function go (licences, billingPeriod) {
  for (const licence of licences) {
    licence.returns = await FetchReturnsForLicenceService.go(licence.licenceRef, billingPeriod)

    const { chargeVersions, returns } = licence

    _prepReturnsForMatching(returns, billingPeriod)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      _sortChargeReferencesBySubsistenceCharge(chargeReferences)
      chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

      // NOTE: Imagine the scenario where a billing account change is due to happen. The users will create a new charge
      // version whose start date will be when the account is due to change, for example 1 Oct. So, the charge version
      // we are looking at has a `startDate:` of 2023-10-01. But then someone marks the licence as revoked in NALD on
      // 2023-08-01. In this scenario DetermineChargePeriodService will return an empty charge period because it will
      // have calculated the charge period start date as 2023-10-01 and the end date as 2023-08-01. Clearly, this is
      // incompatible so the service actually returns `{ startDate: null, endDate: null }`. This check is to handle
      // scenarios like this
      if (chargeVersion.chargePeriod.startDate) {
        chargeReferences.forEach((chargeReference) => {
          const { chargeElements } = chargeReference

          _prepChargeElementsForMatching(chargeElements, chargeVersion.chargePeriod)
        })
      }
    })
  }
}

function _abstractionOutsidePeriod (returnAbstractionPeriods, returnLine) {
  const { startDate, endDate } = returnLine

  return !periodsOverlap(returnAbstractionPeriods, [{ startDate, endDate }])
}

function _prepChargeElementsForMatching (chargeElements, chargePeriod) {
  chargeElements.forEach((chargeElement) => {
    const {
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth
    } = chargeElement

    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      chargePeriod,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth
    )

    chargeElement.returns = []
    chargeElement.allocatedQuantity = 0
    chargeElement.abstractionPeriods = abstractionPeriods
  })
}

function _prepReturnsForMatching (returnRecords, billingPeriod) {
  returnRecords.forEach((returnRecord) => {
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnRecord
    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    let totalQty = 0
    let abstractionOutsidePeriod = false

    returnRecord.versions[0]?.lines.forEach((line) => {
      if (!abstractionOutsidePeriod) {
        abstractionOutsidePeriod = _abstractionOutsidePeriod(abstractionPeriods, line)
      }
      line.unallocated = line.quantity / 1000
      totalQty += line.unallocated
    })

    returnRecord.allocatedQuantity = 0
    returnRecord.totalQuantity = totalQty
    returnRecord.abstractionPeriods = abstractionPeriods
    returnRecord.abstractionOutsidePeriod = abstractionOutsidePeriod
    returnRecord.matched = false
  })
}

function _sortChargeReferencesBySubsistenceCharge (chargeReferences) {
  return chargeReferences.sort((firstChargeReference, secondChargeReference) => {
    const { subsistenceCharge: subsistenceChargeFirst } = firstChargeReference.chargeCategory
    const { subsistenceCharge: subsistenceChargeSecond } = secondChargeReference.chargeCategory

    if (subsistenceChargeFirst > subsistenceChargeSecond) {
      return -1
    }

    if (subsistenceChargeFirst < subsistenceChargeSecond) {
      return 1
    }

    return 0
  })
}

module.exports = {
  go
}
