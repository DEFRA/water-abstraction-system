'use strict'

/**
 * Transforms provided data into the format required for an sroc transaction line
 *
 * @module FormatSrocTransactionLineService
 */

const AbstractionBillingPeriodService = require('./abstraction-billing-period.service.js')
const ConsolidateDateRangesService = require('./consolidate-date-ranges.service.js')

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
    billableDays: _calculateBillableDaysField(chargePeriod, chargeElement, financialYear),
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
 * overlapping days of the financial year and the charge element's abstraction periods
 */
function _calculateAuthorisedDaysField (financialYear, chargeElement) {
  // Define an abstraction period for the financial year, ie. 1/4 to 31/3
  const abstractionPeriodToCalculateFor = {
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3
  }

  return _calculateNumberOfOverlappingDays(abstractionPeriodToCalculateFor, chargeElement, financialYear)
}

/**
 * Calculates the number of authorised days by using AbstractionBillingPeriodService to calculate the number of
 * overlapping days of the charge period and the charge element's abstraction periods
 */
function _calculateBillableDaysField (chargePeriod, chargeElement, financialYear) {
  // Note that we add 1 to the month as JavaScript months are zero-index (ie. 0 = Jan, 1 = Feb etc.)
  const abstractionPeriodToCalculateFor = {
    abstractionPeriodStartDay: chargePeriod.startDate.getDate(),
    abstractionPeriodStartMonth: chargePeriod.startDate.getMonth() + 1,
    abstractionPeriodEndDay: chargePeriod.endDate.getDate(),
    abstractionPeriodEndMonth: chargePeriod.endDate.getMonth() + 1
  }

  return _calculateNumberOfOverlappingDays(abstractionPeriodToCalculateFor, chargeElement, financialYear)
}

/**
 * Takes a period (ie. an object with `startDate` and `endDate`) and uses AbstractionBillingPeriodService to calculate
 * the number of overlapping days of the provided period and the charge element's abstraction periods
 */
function _calculateNumberOfOverlappingDays (abstractionPeriodToCalculateFor, chargeElement, financialYear) {
  // Convert the abstraction periods of the charge element's charge purposes into actual dates
  const chargePurposeDateRanges = _mapAbstractionPeriodsToDateRanges(chargeElement.chargePurposes, financialYear)

  // Consolidate the resulting date ranges to avoid counting the overlapping dates more than once
  const consolidatedDateRanges = ConsolidateDateRangesService.go(chargePurposeDateRanges)

  // AbstractionBillingPeriodService returns an array of abstraction periods, each of which has a `billableDays`
  // property which is the number of overlapping days of the date range and the period we provide it with. Mapping the
  // array we get back would give us an array of arrays; we therefore flatten this after mapping to give us just a flat
  // array of abstraction periods
  const abstractionPeriods = consolidatedDateRanges.map((dateRange) => {
    return AbstractionBillingPeriodService.go(dateRange, abstractionPeriodToCalculateFor)
  }).flat(Infinity)

  // We now sum all the `billableDays` properties of the returned abstraction periods to give us the total number of
  // overlapping days. Note that this could have been done in the previous step by summing as we go but we do it as a
  // separate step for clarity
  const totalBillableDays = abstractionPeriods.reduce((acc, abstractionPeriod) => {
    return acc + abstractionPeriod.billableDays
  }, 0)

  return totalBillableDays
}

/**
 * Takes an array of charge purposes and converts their abstraction periods (which are defined as the start and end
 * day and months) into actual dates in the given financial year, returning them as an array of date ranges (ie.
 * objects with a `startDate` and `endDate` property)
 */
function _mapAbstractionPeriodsToDateRanges (chargePurposes, financialYear) {
  const abstractionPeriods = chargePurposes.map(chargePurpose => {
    const {
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth,
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth
    } = chargePurpose

    const abstractionPeriod = {}
    // Reminder! Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
    // January is actually 0, February is 1 etc. This is why we are always deducting 1 from the months.
    if (endMonth === startMonth) {
      if (endDay >= startDay) {
        abstractionPeriod.startDate = new Date(financialYear, startMonth - 1, startDay)
        abstractionPeriod.endDate = new Date(financialYear, endMonth - 1, endDay)
      } else {
        abstractionPeriod.startDate = new Date(financialYear - 1, startMonth - 1, startDay)
        abstractionPeriod.endDate = new Date(financialYear, endMonth - 1, endDay)
      }
    } else if (endMonth >= startMonth) {
      abstractionPeriod.startDate = new Date(financialYear, startMonth - 1, startDay)
      abstractionPeriod.endDate = new Date(financialYear, endMonth - 1, endDay)
    } else {
      abstractionPeriod.startDate = new Date(financialYear - 1, startMonth - 1, startDay)
      abstractionPeriod.endDate = new Date(financialYear, endMonth - 1, endDay)
    }
    return abstractionPeriod
  })

  return abstractionPeriods
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
