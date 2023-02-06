'use strict'

/**
 * Transforms provided data into the format required for an sroc transaction line
 *
 * @module FormatSrocTransactionLineService
 */

/**
 * @returns {Object[]} an array of billing periods each containing a `startDate` and `endDate`.
 */
function go (chargeElement, chargePeriod) {
  return {
    chargeElementId: chargeElement.id,
    startDate: chargePeriod.startDate,
    endDate: chargePeriod.endDate,
    source: chargeElement.source,
    season: 'all year',
    loss: chargeElement.loss,
    isCredit: false,
    chargeType: 'TODO', // flags.isCompensationCharge ? 'compensation' : 'standard'
    authorisedQuantity: chargeElement.volume,
    billableQuantity: chargeElement.volume,
    authorisedDays: 'TODO',
    billableDays: 'TODO',
    status: 'candidate',
    description: 'TODO',
    volume: chargeElement.volume,
    section126Factor: chargeElement.adjustments.s126 || 1,
    section127Agreement: !!chargeElement.adjustments.s127,
    section130Agreement: !!chargeElement.adjustments.s130,
    isNewLicence: 'TODO',
    isTwoPartSecondPartCharge: 'TODO',
    scheme: 'sroc',
    aggregateFactor: chargeElement.adjustments.aggregate || 1,
    adjustmentFactor: chargeElement.adjustments.charge || 1,
    chargeCategoryCode: chargeElement.billingChargeCategory.reference,
    chargeCategoryDescription: chargeElement.billingChargeCategory.shortDescription,
    isSupportedSource: 'TODO',
    supportedSourceName: 'TODO',
    isWaterCompanyCharge: 'TODO',
    isWinterOnly: !!chargeElement.adjustments.winter,
    isWaterUndertaker: 'TODO',
    purposes: _generatePurposes(chargeElement)
  }
}

/**
 * Returns a json representation of all charge purposes in a charge element
 */
function _generatePurposes (chargeElement) {
  const jsonChargePurposes = chargeElement.chargePurposes.map((chargePurpose) => {
    return chargePurpose.toJSON()
  })

  return JSON.stringify(jsonChargePurposes)
}

module.exports = {
  go
}
