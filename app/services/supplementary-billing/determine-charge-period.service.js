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

  if (_periodIsInvalid(chargeVersion, financialYearEndDate)) {
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
 * Determine if the charge version is valid for the billing period billing period
 *
 * With having to support multi-year charging the only way a charge version could be invalid is when it's start date
 * is after the billing period.
 *
 * Any that start before _might_ be valid. For example, assume the billing period is 2023-24
 *
 * - a charge version that starts on 2023-04-01 is valid
 * - a charge version that starts on 2022-04-01 is valid (with no end date it applies to 2023-24)
 * - a charge version that starts on 2022-04-01 and ends on 2022-06-01 is valid (the charge period will be determined
 *   as outside the billing period. But we still need to process these charge versions in case they have any previous
 *   transactions that need crediting)
 *
 * @param {Object} chargeVersion chargeVersion being billed
 * @param {Date} financialYearEndDate billing period (financial year) end date
 *
 * @returns {boolean} true if invalid else false
 */
function _periodIsInvalid (chargeVersion, financialYearEndDate) {
  return chargeVersion.startDate > financialYearEndDate
}

module.exports = {
  go
}
