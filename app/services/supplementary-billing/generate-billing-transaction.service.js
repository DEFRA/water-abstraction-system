'use strict'

/**
 * Transforms provided data into the format required for an sroc transaction line
 *
 * @module FormatSrocTransactionLineService
 */

const CalculateAuthorisedAndBillableDaysServiceService = require('./calculate-authorised-and-billable-days.service.js')

/**
 * Takes a charge element, charge version and financial year and returns an object representing an sroc transaction
 * line, formatted ready to be inserted into the db.
 *
 * @param {Object} chargeElement The charge element the transaction is to be created for.
 * @param {Integer} billingPeriod The billing period the transaction is to be created for.
 * @param {Object} [options] Object of options to set for the transaction. All options default to `false`
 * @param {Boolean} [options.isCompensationCharge] Is this transaction a compensation charge?
 * @param {Boolean} [options.isWaterUndertaker] Is this transaction for a water undertaker?
 *
 * @returns {Object} The formatted transaction line data.
 */
function go (chargeElement, billingPeriod, chargePeriod, isNewLicence, options) {
  const optionsData = _optionsDefaults(options)

  const { authorisedDays, billableDays } = CalculateAuthorisedAndBillableDaysServiceService.go(
    chargePeriod,
    billingPeriod,
    chargeElement
  )

  return {
    authorisedDays,
    billableDays,
    chargeElementId: chargeElement.chargeElementId,
    startDate: chargePeriod.startDate,
    endDate: chargePeriod.endDate,
    source: chargeElement.source,
    season: 'all year',
    loss: chargeElement.loss,
    isCredit: false,
    chargeType: optionsData.isCompensationCharge ? 'compensation' : 'standard',
    authorisedQuantity: chargeElement.volume,
    billableQuantity: chargeElement.volume,
    status: 'candidate',
    description: _generateDescription(chargeElement, optionsData),
    volume: chargeElement.volume,
    section126Factor: chargeElement.adjustments.s126 || 1,
    section127Agreement: !!chargeElement.adjustments.s127,
    section130Agreement: !!chargeElement.adjustments.s130,
    isNewLicence,
    // NOTE: We do not currently support two part tariff bill runs. We set this to false until we implement that
    // functionality and understand what determines the flag
    isTwoPartSecondPartCharge: false,
    scheme: 'sroc',
    aggregateFactor: chargeElement.adjustments.aggregate || 1,
    adjustmentFactor: chargeElement.adjustments.charge || 1,
    chargeCategoryCode: chargeElement.billingChargeCategory.reference,
    chargeCategoryDescription: chargeElement.billingChargeCategory.shortDescription,
    isSupportedSource: !!chargeElement.additionalCharges?.supportedSource?.name,
    supportedSourceName: chargeElement.additionalCharges?.supportedSource?.name || null,
    isWaterCompanyCharge: !!chargeElement.additionalCharges?.isSupplyPublicWater,
    isWinterOnly: !!chargeElement.adjustments.winter,
    isWaterUndertaker: optionsData.isWaterUndertaker,
    purposes: _generatePurposes(chargeElement)
  }
}

function _optionsDefaults (options) {
  const defaults = {
    isCompensationCharge: false,
    isWaterUndertaker: false
  }

  return {
    ...defaults,
    ...options
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

function _generateDescription (chargeElement, options) {
  if (options.isCompensationCharge) {
    return 'Compensation charge: calculated from the charge reference, activity description and regional environmental improvement charge; excludes any supported source additional charge and two-part tariff charge agreement'
  }

  return `Water abstraction charge: ${chargeElement.description}`
}

module.exports = {
  go
}
