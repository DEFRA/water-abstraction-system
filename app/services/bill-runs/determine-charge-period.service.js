'use strict'

/**
 * Determines what the charge period is for a charge version in a given billing period
 * @module DetermineChargePeriodService
 */

/**
 * Returns a charge period, which is an object comprising `startDate` and `endDate`
 *
 * The charge period is determined as the overlap between the charge version and licence's start and end dates, and the
 * billing period. So, to determine the charge period we look for
 *
 * - the latest start date amongst the charge version, licence and billing period
 * - the earliest end date amongst the charge version, licence and billing period
 *
 * For example, if the licence started on 2017-10-14, the charge version 2022-04-01 and the current billing period is
 * 2023-24 then 2023-04-01 would be the start date.
 *
 * If the licence expires on 2028-05-01, and the charge version has no end date then the current billing period would
 * determine the end date; 2024-03-31.
 *
 * To support multi-year billing the service FetchChargeVersionsService has to pull _all_ charge versions that start
 * before the billing period period ends, for example, even if the billing period is 2023-24 charge versions that start
 * in 2022 need to be included.
 *
 * This is to cover scenarios where a charge version with a start date in 2022-23 would have resulted in a debit in both
 * 2022-23 and 2023-24. Then a new charge version is added that starts in 2022-23. The old one is still valid, but the
 * 2023-24 debit for it needs to be credited. We only know to do that by fetching it when running the
 * `ProcessBillingPeriodService` for 2023-24 so `ProcessTransactionsService` will fetch the previous transactions for
 * it.
 *
 * Add to that licences that end before the charge version or billing period and you get scenarios where the start and
 * end date are incompatible
 *
 * ### An out of period charge version
 *
 * - start dates: charge version 2022-04-01, Licence 2017-10-14, Billing period 2023-04-01
 * - end dates: charge version 2022-08-01, Licence 2028-05-01, Billing period 2024-03-31
 * - result: **incompatible!** start date 2023-04-01 to end date 2022-08-01
 *
 * ### A revoked licence
 *
 * - start dates: charge version 2022-04-01, Licence 2017-10-14, Billing period 2023-04-01
 * - end dates: charge version not set, Licence 2023-01-11, Billing period 2024-03-31
 * - result: **incompatible!** start date 2023-04-01 to end date 2023-01-11
 *
 * ### An expired licence
 *
 * - start dates: charge version 2023-10-01, Licence 2017-10-14, Billing period 2023-04-01
 * - end dates: charge version not set, Licence 2023-08-11, Billing period 2024-03-31
 * - result: **incompatible!** start date 2023-10-01 to end date 2023-08-01
 *
 * When this happens we return an Object with `null` start and end dates. Calling services then know there is no valid
 * charge period and to avoid trying to calculate any billable days.
 *
 * @param {module:ChargeVersionModel} chargeVersion - The charge version being processed for billing
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {object} The start and end date of the calculated charge period
 */
function go (chargeVersion, billingPeriod) {
  const latestStartDateTimestamp = Math.max(
    billingPeriod.startDate,
    chargeVersion.startDate,
    chargeVersion.licence.startDate
  )

  // We use .filter() to remove any null timestamps, as Math.min() assumes a value of `0` for these
  const endDateTimestamps = [
    billingPeriod.endDate,
    chargeVersion.endDate,
    chargeVersion.licence.expiredDate,
    chargeVersion.licence.lapsedDate,
    chargeVersion.licence.revokedDate
  ].filter((timestamp) => {
    return timestamp
  })

  const earliestEndDateTimestamp = Math.min(...endDateTimestamps)

  const chargePeriod = {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }

  if (_periodIsIncompatible(chargePeriod, billingPeriod)) {
    return {
      startDate: null,
      endDate: null
    }
  }

  return chargePeriod
}

function _periodIsIncompatible (chargePeriod, billingPeriod) {
  const startsAfterBillingPeriod = chargePeriod.startDate > billingPeriod.endDate
  const endsBeforeBillingPeriod = chargePeriod.endDate < billingPeriod.startDate
  const startsAfterItEnds = chargePeriod.startDate > chargePeriod.endDate

  return startsAfterBillingPeriod || endsBeforeBillingPeriod || startsAfterItEnds
}

module.exports = {
  go
}
