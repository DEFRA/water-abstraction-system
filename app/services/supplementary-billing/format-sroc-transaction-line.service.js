'use strict'

/**
 * Transforms provided data into the format required for an sroc transaction line
 *
 * @module FormatSrocTransactionLineService
 */

const AbstractionBillingPeriodService = require('./abstraction-billing-period.service.js')

/**
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

function _optionsDefaults (options) {
  const defaults = {
    isCompensationCharge: false
  }

  return {
    ...defaults,
    ...options
  }
}

function _calculateAuthorisedDaysField (financialYear, chargeElement) {
  const billingPeriod = {
    // The financial year starts on 1st April of the year before the one given ie. 01/04/2022 for financial year 2023
    startDate: new Date(financialYear - 1, 3, 1),
    // The financial year ends on 31st March of the year given ie. 31/03/2023 for financial year 2023
    endDate: new Date(financialYear, 2, 31)
  }

  return _calculateNumberOfBillableDays(billingPeriod, chargeElement)
}

function _calculateBillableDaysField (chargePeriod, chargeElement) {
  const billingPeriod = {
    startDate: chargePeriod.startDate,
    endDate: chargePeriod.endDate
  }

  return _calculateNumberOfBillableDays(billingPeriod, chargeElement)
}

function _calculateNumberOfBillableDays (billingPeriod, chargeElement) {
  // Normally AbstractionBillingPeriodService takes a charge purpose instance, but here we want to use the start/end
  // day/month in the charge element. Since these fields in a charge element align with these fields in a charge
  // purpose, we simply pass chargeElement along as-is
  const abstractionPeriods = AbstractionBillingPeriodService.go(billingPeriod, chargeElement)

  // The abstractionPeriods array can potentially have 1 or 2 items: the previous period (which is not always present)
  // and the current period (which is always present) in that order. We always want to use the current period so we
  // simply pop the last item from the array
  const currentPeriod = abstractionPeriods.pop()

  return currentPeriod.billableDays
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
