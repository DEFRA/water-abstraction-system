'use strict'

/**
 * Stuff
 * @module PrepareChargeVersionService
 */
const DetermineAbstractionPeriodService = require('../determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')

/**
 *
 * @param {*} licence
 * @param {*} billingPeriod
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
