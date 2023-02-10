'use strict'

/**
 * Transforms provided data into the format required for an sroc transaction line
 *
 * @module FormatSrocTransactionLineService
 */

const AbstractionBillingPeriodService = require('./abstraction-billing-period.service.js')

/**
 * @param {Object} chargeElement
 * @param {Object} chargePeriod (extracted from the charge version)
 * @param {Integer} financialYear
 * @param {Object} options
 *
 * @returns {Object[]} an array of billing periods each containing a `startDate` and `endDate`.
 */
function go (chargeElement, chargePeriod, financialYear, options) {
  const optionsData = _optionsDefaults(options)

  return {
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
    authorisedDays: _calculateAuthorisedDaysField(financialYear, chargeElement),
    billableDays: _calculateBillableDaysField(chargePeriod, chargeElement),
    status: 'candidate',
    description: _generateDescription(chargeElement, optionsData),
    volume: chargeElement.volume,
    section126Factor: chargeElement.adjustments.s126 || 1,
    section127Agreement: !!chargeElement.adjustments.s127,
    section130Agreement: !!chargeElement.adjustments.s130,
    isNewLicence: optionsData.isNewLicence,
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
    isWaterUndertaker: false,
    isNewLicence: false
  }

  return {
    ...defaults,
    ...options
  }
}

/**
 * Calculates the number of authorised days by using AbstractionBillingPeriodService to calculate the number of
 * overlapping days of the financial year and the charge element's abstraction period
 */
function _calculateAuthorisedDaysField (financialYear, chargeElement) {
  const periodToCalculateFor = {
    // The financial year starts on 1st April of the year before the one given ie. 01/04/2022 for financial year 2023
    startDate: new Date(financialYear - 1, 3, 1),
    // The financial year ends on 31st March of the year given ie. 31/03/2023 for financial year 2023
    endDate: new Date(financialYear, 2, 31)
  }

  return _calculateNumberOfOverlappingDays(periodToCalculateFor, chargeElement)
}

/**
 * Calculates the number of authorised days by using AbstractionBillingPeriodService to calculate the number of
 * overlapping days of the charge period and the charge element's abstraction period
 */
function _calculateBillableDaysField (chargePeriod, chargeElement) {
  const periodToCalculateFor = {
    startDate: chargePeriod.startDate,
    endDate: chargePeriod.endDate
  }

  return _calculateNumberOfOverlappingDays(periodToCalculateFor, chargeElement)
}

/**
 * Takes a period (ie. an object with `startDate` and `endDate`) and uses AbstractionBillingPeriodService to calculate
 * the number of overlapping days of the provided period and the charge element's abstraction period
 */
function _calculateNumberOfOverlappingDays (periodToCalculateFor, chargeElement) {
  // Normally AbstractionBillingPeriodService takes a charge purpose instance, but here we want to use the start/end
  // day/month in the charge element. Since these fields in a charge element align with these fields in a charge
  // purpose, we simply pass chargeElement along as-is
  const abstractionPeriods = AbstractionBillingPeriodService.go(periodToCalculateFor, chargeElement)

  // abstractionPeriods comes back as an array of one or more periods, each with a billableDays property. We need to add
  // all of these to get our final number of billble days
  const billableDays = abstractionPeriods.reduce((acc, abstractionPeriod) => {
    return acc + abstractionPeriod.billableDays
  }, 0)

  return billableDays
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
