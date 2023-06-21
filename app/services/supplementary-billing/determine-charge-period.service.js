'use strict'

/**
 * Determines what the charge period is for a charge version in a given billing period
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
 * @param {module:ChargeVersionModel} chargeVersion The charge version being processed for billing
 * @param {Number} financialYearEnding The year the financial billing period ends
 *
 * @returns {{startDate: Date, endDate: Date}} The start and end date of the calculated charge period
 */
function go (chargeVersion, financialYearEnding) {
  const financialYearStartDate = new Date(financialYearEnding - 1, 3, 1)
  const financialYearEndDate = new Date(financialYearEnding, 2, 31)

  if (_periodIsInvalid(chargeVersion, financialYearStartDate, financialYearEndDate)) {
    throw new Error(`Charge version is outside billing period ${financialYearEnding}`)
  }

  const latestStartDateTimestamp = Math.max(
    financialYearStartDate,
    chargeVersion.startDate,
    chargeVersion.licence.startDate
  )

  // We use .filter() to remove any null timestamps, as Math.min() assumes a value of `0` for these
  const endDateTimestamps = [
    financialYearEndDate,
    chargeVersion.endDate,
    chargeVersion.licence.expiredDate,
    chargeVersion.licence.lapsedDate,
    chargeVersion.licence.revokedDate
  ].filter((timestamp) => timestamp)

  const earliestEndDateTimestamp = Math.min(...endDateTimestamps)

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
  // `billedUptoOrEndDate` added because if a licence was charged in 2024 FY but then later ended in the 2023 FY due to
  // a Billing contact change. When the supplementary is re-run, the charge made to the original contact in 2024 would
  // not be taken into account, as the endDate on the CV would be prior to the start of the 2024 FY. So we need to take
  // into account when the CV was last billed up to so credits can be made to the original contact if required.
  const billedUptoOrEndDate = chargeVersion.billedUptoDate ? chargeVersion.billedUptoDate : chargeVersion.endDate

  const chargeVersionStartsAfterFinancialYear = chargeVersion.startDate > financialYearEndDate
  const chargeVersionEndsBeforeFinancialYear = chargeVersion.endDate && billedUptoOrEndDate < financialYearStartDate

  return chargeVersionStartsAfterFinancialYear || chargeVersionEndsBeforeFinancialYear
}

module.exports = {
  go
}
