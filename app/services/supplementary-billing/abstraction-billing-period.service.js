'use strict'

/**
 * Calculates billing periods needed when generating a supplementary bill run
 * @module AbstractionBillingPeriodService
 */

/**
 * Calculate for a given charge purpose and billing period the 'billable' abstraction periods
 *
 * In WRLS the charge purpose, linked to a charge version via the charge element, holds the abstraction period
 * information. The abstraction period is the time when a licensee is permitted to abstract water. They are held as a
 * start and end day and month, for example 1 Apr to 31 Oct. They do not have years because the intent is they are the
 * same period no matter what year it is.
 *
 * The charge a licensee is expected to pay is based on how much of an abstraction period is 'billable' within a given
 * billing period, for example, 2022-04-01 to 2023-03-31.
 *
 * The problem is abstraction periods do not intersect nicely with billing periods. The abstraction might start or end
 * outside of the billing period, and apply twice! For example, 1 Jan to 30 Jun intersects twice with a billing period
 * of 2022-04-01 to 2023-03-31.
 *
 * - 1 Jan 2022 to 30 Jun 2022
 * - 1 Jan 2023 to 30 Jun 2023
 *
 * This is why we always return 2 abstraction periods for each charge purpose. For each period, we calculate the
 * 'billable days'. This is how much of the period intersects with the billing period. Finally, we add a 'consider'
 * flag. This is a boolean which identifies whether a period intersects the billing period. For example, if the
 * abstraction period was 1 Jan to 31 Mar, only one of the periods we create would intersect with a billing period of
 * 2022-04-01 to 2023-03-31
 *
 * - 1 Jan 2022 to 31 Mar 2022 - `false`
 * - 1 Jan 2023 to 31 Mar 2023 - `true`
 *
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {module:ChargePurposeModel} chargePurpose The abstraction period to be checked
 *
 * @returns {Object[]} An array of abstraction periods
 * @returns {Date} periods[].startDate
 * @returns {Date} periods[].endDate
 * @returns {boolean} periods[].consider
 * @returns {number} periods[].billableDays
 */
function go (billingPeriod, chargePurpose) {
  const abstractionPeriods = _abstractionPeriods(billingPeriod, chargePurpose)

  _flagPeriodsForConsideration(billingPeriod, abstractionPeriods)

  _calculateBillablePeriods(abstractionPeriods, billingPeriod)

  _calculateBillableDays(abstractionPeriods)

  return abstractionPeriods
}

/**
 * Create the abstraction billing periods
 *
 * Before we can calculate the billable days and whether a period should be considered, we first have to assign a year
 * to our abstraction start and end values, for example 1 Apr to 31 Oct.
 *
 * ## In-year
 *
 * If the abstraction period end month is _after_ the start month, for example 01-Jan to 31-May, then we assign the
 * billing period's end year year to both the abstraction start and end dates.
 *
 * - **Billing period** 01-Apr-2022 to 31-Mar-2023
 * - **Abstraction period** 01-Jan to 31-May
 *
 * **Result:** Abstraction period is 01-Jan-2023 to 31-May-2023
 *
 * We then create a previous period by deducting 1 year from the calculated abstraction period.
 *
 * - 01-Jan-2023 to 31-May-2023
 * - 01-Jan-2022 to 31-May-2022
 *
 * ## Out-year
 *
 * If the abstraction period end month is _before_ the start month, for example 01-Nov to 31-Mar, then we assign the
 * billing period's end year year to the end date, and start year to the start date.
 *
 * - **Billing period** 01-Apr-2022 to 31-Mar-2023
 * - **Abstraction period** 01-Nov to 31-Mar
 *
 * **Result:** Abstraction period is 01-Nov-2022 to 31-Mar-2023
 *
 * We then create a previous period by deducting 1 year from the calculated abstraction period.
 *
 * - 01-Nov-2022 to 31-Mar-2023
 * - 01-Nov-2021 to 31-Mar-2022
 *
 * ## Months are equal
 *
 * We also handle the edge case of the months being equal. If this is the case we still treat the abstraction period as
 * in-year and out-year, only we use the days in the comparison instead of the months.
 *
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {module:ChargePurposeModel} chargePurpose The abstraction period to be checked
 *
 * @returns {Object[]} An array of abstraction periods
 * @returns {Date} periods[].startDate
 * @returns {Date} periods[].endDate
 */
function _abstractionPeriods (billingPeriod, chargePurpose) {
  const billingPeriodStartYear = billingPeriod.startDate.getFullYear()
  const billingPeriodEndYear = billingPeriod.endDate.getFullYear()
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = chargePurpose
  const firstPeriod = {}

  // Reminder! Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
  // January is actually 0, February is 1 etc. This is why we are always deducting 1 from the months.
  if (endMonth === startMonth) {
    if (endDay >= startDay) {
      firstPeriod.startDate = new Date(billingPeriodEndYear, startMonth - 1, startDay)
      firstPeriod.endDate = new Date(billingPeriodEndYear, endMonth - 1, endDay)
    } else {
      firstPeriod.startDate = new Date(billingPeriodStartYear, startMonth - 1, startDay)
      firstPeriod.endDate = new Date(billingPeriodEndYear, endMonth - 1, endDay)
    }
  } else if (endMonth >= startMonth) {
    firstPeriod.startDate = new Date(billingPeriodEndYear, startMonth - 1, startDay)
    firstPeriod.endDate = new Date(billingPeriodEndYear, endMonth - 1, endDay)
  } else {
    firstPeriod.startDate = new Date(billingPeriodStartYear, startMonth - 1, startDay)
    firstPeriod.endDate = new Date(billingPeriodEndYear, endMonth - 1, endDay)
  }

  const previousPeriod = {
    startDate: _subtractOneYear(firstPeriod.startDate),
    endDate: _subtractOneYear(firstPeriod.endDate)
  }

  return [previousPeriod, firstPeriod]
}

/**
 * Calculates the 'billable days' for each abstraction billing period
 *
 * @param {Object[]} abstractionPeriods An array of abstraction billing periods
 *
 * @returns {Object[]} The array abstraction periods each with a new `billableDays` property
 * @returns {Date} periods[].startDate
 * @returns {Date} periods[].endDate
 * @returns {boolean} periods[].consider
 * @returns {Date} periods[].billableStartDate
 * @returns {Date} periods[].billableEndDate
 * @returns {number} periods[].billableDays
 */
function _calculateBillableDays (abstractionPeriods) {
  for (const abstractionPeriod of abstractionPeriods) {
    if (abstractionPeriod.billableStartDate) {
      const difference = abstractionPeriod.billableEndDate.getTime() - abstractionPeriod.billableStartDate.getTime() // difference in msecs
      const billableDays = Math.ceil(difference / (1000 * 3600 * 24)) + 1 // (1000 msecs * (60 secs * 60 mins) * 24 hrs)
      abstractionPeriod.billableDays = billableDays
    }
  }
}

/**
 * Calculates the 'billable period' for each abstraction billing period
 *
 * @param {Object[]} abstractionPeriods An array of abstraction billing periods
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 *
 * @returns {Object[]} The array abstraction periods each with new `billableStartDate` & `billableEndDate` properties
 * @returns {Date} periods[].startDate
 * @returns {Date} periods[].endDate
 * @returns {boolean} periods[].consider
 * @returns {Date} periods[].billableStartDate
 * @returns {Date} periods[].billableEndDate
 */
function _calculateBillablePeriods (abstractionPeriods, billingPeriod) {
  let billableStartDate
  let billableEndDate
  for (const abstractionPeriod of abstractionPeriods) {
    if (abstractionPeriod.startDate < billingPeriod.startDate) {
      billableStartDate = billingPeriod.startDate
    } else {
      billableStartDate = abstractionPeriod.startDate
    }

    if (abstractionPeriod.endDate > billingPeriod.endDate) {
      billableEndDate = billingPeriod.endDate
    } else {
      billableEndDate = abstractionPeriod.endDate
    }

    if (billableStartDate <= billableEndDate) {
      abstractionPeriod.billableStartDate = billableStartDate
      abstractionPeriod.billableEndDate = billableEndDate
    }
  }
}

/**
 * Adds the `consider` flag to each abstraction billing period as to whether it should be included in billing
 *
 * The flag is determined by calculating whether the abstraction period intersects with the billing period. For example,
 * if the billing period is 2022-04-01 to 2023-03-31 and the abstraction period was 01-Nov to 31-Mar:
 *
 * - 01-Nov-2022 to 31-Mar-2023 = `true`
 * - 01-Nov-2021 to 31-Mar-2022 = `false`
 *
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {Object[]} abstractionPeriods An array of abstraction billing periods
 *
 * @returns {Object[]} The array abstraction periods each with a new `consider` property
 * @returns {Date} periods[].startDate
 * @returns {Date} periods[].endDate
 * c
 */
function _flagPeriodsForConsideration (billingPeriod, abstractionPeriods) {
  for (const abstractionPeriod of abstractionPeriods) {
    if (abstractionPeriod.startDate > billingPeriod.endDate) {
      abstractionPeriod.consider = false
    } else if (abstractionPeriod.endDate < billingPeriod.startDate) {
      abstractionPeriod.consider = false
    } else {
      abstractionPeriod.consider = true
    }
  }
}

function _subtractOneYear (date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

module.exports = {
  go
}
