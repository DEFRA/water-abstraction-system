'use strict'

/**
 * Prepares the charge version for matching
 * @module PrepareChargeVersionService
 */

const DetermineAbstractionPeriodService = require('../determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')

/**
 * Prepares the charge version for matching with its returns
 *
 * This function performs the following steps:
 *
 * Sorts all charge references belonging to the charge version by subsistence charge in descending order. This ensures
 * that allocation is performed with the highest subsistence charge first.
 *
 * Determines the charge period for the charge version using an external service and sets it as a property on the charge
 * version object.
 *
 * Loops through each charge reference's elements, preparing them for matching. This involves determining the
 * abstraction period for each element and adding properties such as returnLogs, allocatedQuantity, and
 * abstractionPeriods.
 *
 * @param {module:ChargeVersionModel} chargeVersion - The charge version to prepare
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 */
function go (chargeVersion, billingPeriod) {
  const { chargeReferences } = chargeVersion

  _sortChargeReferencesBySubsistenceCharge(chargeReferences)
  chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

  chargeReferences.forEach((chargeReference) => {
    const { chargeElements } = chargeReference

    _prepareChargeElementsForMatching(chargeElements, chargeVersion.chargePeriod)
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
