'use strict'

/**
 * Transforms provided data into the format required for an sroc transaction line
 * @module DetermineChargePeriodService
 */

/**
 * Returns a charge period, which is an object comprising `startDate` and `endDate`
 *
 * The charge period is determined as the overlap between the charge version's start and end dates, and the financial
 * year. So the charge period's start date is the later of the two's start dates, and the charge period end date is the
 * earlier of the two's end dates.
 *
 * > Charge versions may not have an end date; in this case, we simply use the financial year end date.
 *
 * @param {module:ChargeVersionModel} chargeVersion the charge version being processed for billing
 * @param {number} financialYearEnding the year the financial billing period ends
 *
 * @returns {Object} the start and end date of the calculated charge period
 */
function go (chargeVersion, financialYearEnding) {
  const financialYearStartDate = new Date(financialYearEnding - 1, 3, 1)
  const financialYearEndDate = new Date(financialYearEnding, 2, 31)

  if (_periodIsInvalid(chargeVersion, financialYearStartDate, financialYearEndDate)) {
    throw new Error(`Charge version is outside billing period ${financialYearEnding}`)
  }

  const chargeVersionStartDate = chargeVersion.startDate
  const latestStartDateTimestamp = Math.max(financialYearStartDate, chargeVersionStartDate)

  // If the charge version has no end date then use the financial year end date instead
  const chargeVersionEndDate = chargeVersion.endDate || financialYearEndDate
  const earliestEndDateTimestamp = Math.min(financialYearEndDate, chargeVersionEndDate)

  return {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }
}

/**
 * Determine if the charge version starts after or ends before the billing period
 *
 * We never expect a charge version outside the financial period but we do this just to ensure we never return
 * nonsense and all possible scenarios are covered in our tests 😁
 *
 * @param {Object} chargeVersion chargeVersion being billed
 * @param {Date} financialYearStartDate billing period (financial year) start date
 * @param {Date} financialYearEndDate billing period (financial year) end date
 *
 * @returns {boolean} true if invalid else false
 */
function _periodIsInvalid (chargeVersion, financialYearStartDate, financialYearEndDate) {
  const chargeVersionStartsAfterFinancialYear = chargeVersion.startDate > financialYearEndDate
  const chargeVersionEndsBeforeFinancialYear = chargeVersion.endDate && chargeVersion.endDate < financialYearStartDate

  return chargeVersionStartsAfterFinancialYear || chargeVersionEndsBeforeFinancialYear
}

module.exports = {
  go
}
