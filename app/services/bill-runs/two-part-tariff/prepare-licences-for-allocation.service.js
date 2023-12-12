'use strict'

/**
 * Prepares and sorts the charge reference and return logs ready for matching and allocating
 * @module PrepareLicencesForAllocationService
 */

const DetermineAbstractionPeriodService = require('../determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const FetchReturnLogsForLicenceService = require('./fetch-return-logs-for-licence.service.js')
const { periodsOverlap } = require('../../../lib/general.lib.js')

async function go (licences, billingPeriod) {
  for (const licence of licences) {
    await _prepareReturnLogs(licence, billingPeriod)
    _prepareChargeVersions(licence, billingPeriod)
  }
}

function _abstractionOutsidePeriod (returnAbstractionPeriods, returnLine) {
  const { startDate, endDate } = returnLine

  return !periodsOverlap(returnAbstractionPeriods, [{ startDate, endDate }])
}

function _prepareChargeVersions (licence, billingPeriod) {
  const { chargeVersions } = licence

  chargeVersions.forEach((chargeVersion) => {
    const { chargeReferences } = chargeVersion

    _sortChargeReferencesBySubsistenceCharge(chargeReferences)
    chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    //     // NOTE: Imagine the scenario where a billing account change is due to happen. The users will create a new charge
    //     // version whose start date will be when the account is due to change, for example 1 Oct. So, the charge version
    //     // we are looking at has a `startDate:` of 2023-10-01. But then someone marks the licence as revoked in NALD on
    //     // 2023-08-01. In this scenario DetermineChargePeriodService will return an empty charge period because it will
    //     // have calculated the charge period start date as 2023-10-01 and the end date as 2023-08-01. Clearly, this is
    //     // incompatible so the service actually returns `{ startDate: null, endDate: null }`. This check is to handle
    //     // scenarios like this
    if (chargeVersion.chargePeriod.startDate) {
      chargeReferences.forEach((chargeReference) => {
        const { chargeElements } = chargeReference

        _prepareChargeElementsForMatching(chargeElements, chargeVersion.chargePeriod)
      })
    }
  })
}

function _prepareChargeElementsForMatching (chargeElements, chargePeriod) {
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

    chargeElement.returnLogs = []
    chargeElement.allocatedQuantity = 0
    chargeElement.abstractionPeriods = abstractionPeriods
  })
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
