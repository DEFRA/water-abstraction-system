'use strict'

/**
 * Calculates authorised and billable days for a given charge element
 * @module CalculateAuthorisedAndBillableDaysService
 */

const ConsolidateDateRangesService = require('./consolidate-date-ranges.service.js')

/**
 * Returns the authorised and billable days for a given charge element based on its abstraction periods
 *
 * In WRLS the charge purpose, linked to a charge version via the charge element, holds the abstraction period
 * information. The abstraction period is the time when a licensee is permitted to abstract water. They are held as a
 * start and end day and month, for example 1 Apr to 31 Oct. They do not have years because the intent is they are the
 * same period no matter what year it is.
 *
 * **Authorised** days is how much of the billing period overlaps with the abstraction period. **Billable** days is
 * how much of the charge period overlaps with the abstraction period (see params for explanations of billable and
 * charge periods).
 *
 * Calculating these values is complicated by the fact a charge element may have multiple abstraction periods. Added to
 * that abstraction periods do not intersect nicely with billing or charge periods. The abstraction period might start
 * or end outside of the billing period, and so apply twice! For example, 1 Jan to 30 Jun intersects twice with a
 * billing period of 2022-04-01 to 2023-03-31.
 *
 * - **1 Jan 2022 to 30 Jun 2022** intersects as 1 Apr 2022 to 30 Jun 2022
 * - **1 Jan 2023 to 30 Jun 2023** intersects as 1 Jan 2023 to 31 Mar 2023
 *
 * The number of days the abstraction period intersects either the billing or charge period is where we get our 'days'
 * from. The final complication is we cannot double count. If 2 charge purposes have abstraction periods that overlap
 * we must only count one of them. For example
 *
 * - charge purpose 1 has **1 Jan to 30 Jun**
 * - charge purpose 2 has **1 May to 31 Oct**
 *
 * They overlap 1 May to 30 Jun. To get our days we summate the result for each abstraction period and have to ensure
 * we only count this once.
 *
 * So, a charge purpose's abstraction dates might result in 2 relevant abstraction periods. A charge element might have
 * multiple charge purposes. But we must return a single **Authorised** and **Billable** days calculation. This problem
 * is what this service tackles.
 *
 * @param {Object} chargePeriod charge period is determined as the overlap between a charge version's start and end
 * dates, and the billing period's (financial year) start and end dates. So, when the charge version and billing period
 * are compared the charge period's start date is the latest of the two, and the end date is the earliest of their end
 * dates
 * @param {Date} chargePeriod.startDate
 * @param {Date} chargePeriod.endDate
 * @param {Object} billingPeriod the period a billing batch is being calculated for. Currently, this always equates to
 * a financial year, for example, 2022-04-01 to 2023-03-31
 * @param {Date} billingPeriod.startDate
 * @param {Date} billingPeriod.endDate
 * @param {module:ChargeElementModel} chargeElement referred to as the 'charge reference' in the UI, for example,
 * 4.1.10. A charge version can have multiple charge elements, though each will have a different reference. Each element
 * can have multiple charge purposes and it's these that hold the abstraction period data
 *
 * @returns {Object} an object containing an `authorisedDays` and `billableDays` property
 */
function go (chargePeriod, billingPeriod, chargeElement) {
  const { chargePurposes } = chargeElement

  const authorisedAbstractionPeriods = []
  const billableAbstractionPeriods = []

  for (const chargePurpose of chargePurposes) {
    authorisedAbstractionPeriods.push(..._abstractionPeriods(billingPeriod, chargePurpose))
    billableAbstractionPeriods.push(..._abstractionPeriods(chargePeriod, chargePurpose))
  }

  return {
    authorisedDays: _consolidateAndCalculate(billingPeriod, authorisedAbstractionPeriods),
    billableDays: _consolidateAndCalculate(chargePeriod, billableAbstractionPeriods)
  }
}

/**
 * Calculate from a charge purpose's abstraction data the relevant abstraction periods
 *
 * Before we can calculate the days and whether a period should be considered, we first have to assign a year to the
 * charge purpose's start and end values, for example, 1 Apr to 31 Oct.
 *
 * ## In-year
 *
 * If the abstraction period end month is _after_ the start month, for example 01-Jan to 31-May, then we assign the
 * reference period's end year to both the abstraction start and end dates.
 *
 * - **Reference period** 01-Apr-2022 to 31-Mar-2023
 * - **Abstraction period** 01-Jan to 31-May
 *
 * **Result:** Abstraction period is 01-Jan-2023 to 31-May-2023
 *
 * We then create a previous period by deducting 1 year from the one we calculated, for example, 01-Jan-2022 to
 * 31-May-2022. The result is 2 abstraction periods
 *
 * - 01-Jan-2023 to 31-May-2023
 * - 01-Jan-2022 to 31-May-2022
 *
 * ## Out-year
 *
 * If the abstraction period end month is _before_ the start month, for example 01-Nov to 31-Mar, then we assign the
 * reference period's end year to the end date, and start year to the start date.
 *
 * - **Reference period** 01-Apr-2022 to 31-Mar-2023
 * - **Abstraction period** 01-Nov to 31-Mar
 *
 * **Result:** Abstraction period is 01-Nov-2022 to 31-Mar-2023
 *
 * We then create a previous period by deducting 1 year from the one we calculated, for example, 01-Nov-2022 to
 * 31-Mar-2023. The result is 2 abstraction periods
 *
 * - 01-Nov-2022 to 31-Mar-2023
 * - 01-Nov-2021 to 31-Mar-2022
 *
 * ## Months are equal
 *
 * We also handle the edge case of the months being equal. If this is the case we still treat the abstraction period as
 * in-year and out-year, only we use the days in the comparison instead of the months.
 *
 * ---
 *
 * The abstraction periods that are created are then checked to see if they fall within the reference period and added
 * to the `abstractionPeriods` array which then gets returned.
 *
 * @param {Object} referencePeriod either the billing period or charge period
 * @param {module:ChargePurposeModel} chargePurpose holds the abstraction start and end day and month values
 *
 * @returns {Object[]} An array of 1 or 2 abstraction periods each containing a start and end date
 */
function _abstractionPeriods (referencePeriod, chargePurpose) {
  const periodStartYear = referencePeriod.startDate.getFullYear()
  const periodEndYear = referencePeriod.endDate.getFullYear()
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
      firstPeriod.startDate = new Date(periodEndYear, startMonth - 1, startDay)
      firstPeriod.endDate = new Date(periodEndYear, endMonth - 1, endDay)
    } else {
      firstPeriod.startDate = new Date(periodStartYear, startMonth - 1, startDay)
      firstPeriod.endDate = new Date(periodEndYear, endMonth - 1, endDay)
    }
  } else if (endMonth >= startMonth) {
    firstPeriod.startDate = new Date(periodEndYear, startMonth - 1, startDay)
    firstPeriod.endDate = new Date(periodEndYear, endMonth - 1, endDay)
  } else {
    firstPeriod.startDate = new Date(periodStartYear, startMonth - 1, startDay)
    firstPeriod.endDate = new Date(periodEndYear, endMonth - 1, endDay)
  }

  const previousPeriod = {
    startDate: _subtractOneYear(firstPeriod.startDate),
    endDate: _subtractOneYear(firstPeriod.endDate)
  }

  const abstractionPeriods = []
  if (_isPeriodValid(referencePeriod, previousPeriod)) {
    abstractionPeriods.push(previousPeriod)
  }

  if (_isPeriodValid(referencePeriod, firstPeriod)) {
    abstractionPeriods.push(firstPeriod)
  }

  return abstractionPeriods
}

function _calculateDays (abstractionOverlapPeriod) {
  const DAY_IN_MILLISECONDS = (24 * 60 * 60 * 1000) // (24 hrs * 60 mins * 60 secs * 1000 msecs)
  let days = 0

  if (abstractionOverlapPeriod.startDate) {
    // difference in msecs
    const difference = abstractionOverlapPeriod.endDate.getTime() - abstractionOverlapPeriod.startDate.getTime()
    days = Math.ceil(difference / DAY_IN_MILLISECONDS) + 1
  }

  return days
}

function _calculateAbstractionOverlapPeriod (referencePeriod, abstractionPeriod) {
  let startDate
  let endDate

  if (abstractionPeriod.startDate < referencePeriod.startDate) {
    startDate = referencePeriod.startDate
  } else {
    startDate = abstractionPeriod.startDate
  }

  if (abstractionPeriod.endDate > referencePeriod.endDate) {
    endDate = referencePeriod.endDate
  } else {
    endDate = abstractionPeriod.endDate
  }

  if (startDate <= endDate) {
    return {
      startDate,
      endDate
    }
  }

  return {}
}

function _consolidateAndCalculate (referencePeriod, abstractionsPeriods) {
  const consolidatedAbstractionPeriods = ConsolidateDateRangesService.go(abstractionsPeriods)

  let days = 0
  for (const abstractionPeriod of consolidatedAbstractionPeriods) {
    const abstractionOverlapPeriod = _calculateAbstractionOverlapPeriod(referencePeriod, abstractionPeriod)
    days += _calculateDays(abstractionOverlapPeriod)
  }

  return days
}

/**
 * Checks each abstraction period to see whether it has days that should be counted
 *
 * This is determined by calculating whether the abstraction period intersects with the reference period. For example,
 * if the reference period is 2022-04-01 to 2023-03-31 and the abstraction period is 01-Nov to 31-Mar:
 *
 * - 01-Nov-2022 to 31-Mar-2023 = `true`
 * - 01-Nov-2021 to 31-Mar-2022 = `false`
 *
 * @param {Object} referencePeriod Object that has a `startDate` and `endDate` that defines the reference period
 * @param {Object} abstractionPeriod Object that has a `startDate` and `endDate` that defines the abstraction period
 *
 * @returns {Boolean} true if the abstraction period intersects the reference period
 */
function _isPeriodValid (referencePeriod, abstractionPeriod) {
  if (abstractionPeriod.startDate > referencePeriod.endDate) {
    return false
  } else if (abstractionPeriod.endDate < referencePeriod.startDate) {
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
