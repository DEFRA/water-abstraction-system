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
 * This is why we always calculate 2 abstraction periods for each charge purpose which we then subsequently check and
 * disgard if they fall outside the billing period. For each valid period we calculate the 'billing period', from
 * which we calculate the 'billable days'. This is how much of the period intersects with the billing period.
 *
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {module:ChargePurposeModel} chargePurpose The abstraction period to be checked
 *
 * @returns {Object[]} An array of abstraction periods
 */
function go (billingPeriod, chargePurpose) {
  const abstractionPeriods = _abstractionPeriods(billingPeriod, chargePurpose)

  for (const abstractionPeriod of abstractionPeriods) {
    _calculateBillablePeriods(abstractionPeriod, billingPeriod)
    _calculateBillableDays(abstractionPeriod)
  }

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
 * The date ranges that are created are then checked to see if they fall within the billing period and added to the
 * `abstractionPeriods` array if valid.
 *
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {module:ChargePurposeModel} chargePurpose The abstraction period to be checked
 *
 * @returns {Object[]} An array of abstraction periods
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

  const abstractionPeriods = []
  if (_isPeriodValid(previousPeriod, billingPeriod)) {
    abstractionPeriods.push(previousPeriod)
  }

  if (_isPeriodValid(firstPeriod, billingPeriod)) {
    abstractionPeriods.push(firstPeriod)
  }

  return abstractionPeriods
}

/**
 * Calculates the 'billable days' for a billable abstraction period
 *
 * @param {Object} abstractionPeriod An abstraction billing period
 *
 */
function _calculateBillableDays (abstractionPeriod) {
  const DAY_IN_MILLISECONDS = (24 * 60 * 60 * 1000) // (24 hrs * 60 mins * 60 secs * 1000 msecs)
  if (abstractionPeriod.billableStartDate) {
    const difference = abstractionPeriod.billableEndDate.getTime() - abstractionPeriod.billableStartDate.getTime() // difference in msecs
    const billableDays = Math.ceil(difference / DAY_IN_MILLISECONDS) + 1
    abstractionPeriod.billableDays = billableDays
  }
}

/**
 * Calculates the 'billable period' for an abstraction billing period
 *
 * @param {Object} abstractionPeriod An abstraction billing period
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 *
 * @returns {Object} The abstraction period with new `billableStartDate` & `billableEndDate` properties
 */
function _calculateBillablePeriods (abstractionPeriod, billingPeriod) {
  let billableStartDate
  let billableEndDate

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

/**
 * Checks each abstraction billing period to see whether it should be included in billing
 *
 * This is determined by calculating whether the abstraction period intersects with the billing period. For example,
 * if the billing period is 2022-04-01 to 2023-03-31 and the abstraction period was 01-Nov to 31-Mar:
 *
 * - 01-Nov-2022 to 31-Mar-2023 = `true`
 * - 01-Nov-2021 to 31-Mar-2022 = `false`
 *
 * @param {Object} abstractionPeriod Object that has a `startDate` and `endDate` that defines the abstraction period
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 *
 * @returns {Boolean} True if the `abstractionPeriod` intersects the `billingPeriod`
 * c
 */
function _isPeriodValid (abstractionPeriod, billingPeriod) {
  if (abstractionPeriod.startDate > billingPeriod.endDate) {
    return false
  } else if (abstractionPeriod.endDate < billingPeriod.startDate) {
    return false
  } else {
    return true
  }
}

function _subtractOneYear (date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

module.exports = {
  go
}
