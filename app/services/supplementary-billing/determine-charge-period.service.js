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

  const startDate = new Date(latestStartDateTimestamp)
  const endDate = new Date(earliestEndDateTimestamp)

  if (_periodIsIncompatible(startDate, endDate, financialYearStartDate, financialYearEndDate)) {
    return {
      startDate: null,
      endDate: null
    }
  }

  return {
    startDate,
    endDate
  }
}

/**
 * Determine if the charge version is irrelevant for the billing period
 *
 * To support multi-year billing our service FetchChargeVersionsService has to pull _all_ charge versions that start
 * before the billing period period ends, for example, even if the billing period is 2023-24 charge versions that start
 * in 2022 need to be included.
 *
 * This is to cover scenarios where a charge version with a start date in 2022-23 would have resulted in a debit in
 * both 2022-23 and 2023-24 (continuing our example). Then a new charge version is added that starts in 2022-23. The old
 * one is still valid, but the 2023-24 debit for it needs to be credited. We only know to do that by fetching it when
 * running the `ProcessBillingPeriodService` for 2023-24 because `ProcessBillingTransactionsService` will fetch
 * the previous transactions for it.
 *
 * What does all this mean? It means this service will be given a charge version and a financial year ending that are
 * incompatible.
 *
 * Our logic in `go()` is based on working out the latest start date and earliest end date to determine the 'charge
 * period'. In our scenario that would result in
 *
 * ```javascript
 * {
 *   startDate: new Date(2023-04-01),
 *   endDate: new Date(2022-06-01)
 * }
 * ```
 *
 * So, our billing engine still needs to process the charge version to see if any previous transactions for the current
 * billing period need crediting. But there is no point in trying to determine the charge period and this function tells
 * us when that is the case.
 *
 * @param {Object} chargeVersion chargeVersion being billed
 * @param {Date} financialYearStartDate billing period (financial year) end date
 * @param {Date} financialYearEndDate billing period (financial year) end date
 *
 * @returns {boolean} true if invalid else false
 */
function _periodIsIncompatible (startDate, endDate, financialYearStartDate, financialYearEndDate) {
  const startsAfterFinancialYear = startDate > financialYearEndDate
  const endsBeforeFinancialYear = endDate < financialYearStartDate

  return startsAfterFinancialYear || endsBeforeFinancialYear
}

module.exports = {
  go
}
