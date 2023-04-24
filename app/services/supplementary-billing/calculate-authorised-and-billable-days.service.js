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
 * **Authorised** days is how much of the billing period overlaps with the abstraction period. **Billable** days is how
 * much of the charge period overlaps with the abstraction period (see params for explanations of billable and charge
 * periods).
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
 * from. The final complication is we cannot double count. If 2 charge purposes have abstraction periods that overlap we
 * must only count one of them. For example
 *
 * - charge purpose 1 has **1 Jan to 30 Jun**
 * - charge purpose 2 has **1 May to 31 Oct**
 *
 * They overlap 1 May to 30 Jun. To get our days we summate the result for each abstraction period and have to ensure we
 * only count this once.
 *
 * So, a charge purpose's abstraction dates might result in 2 relevant abstraction periods. A charge element might have
 * multiple charge purposes. But we must return a single **Authorised** and **Billable** days calculation. This problem
 * is what this service tackles.
 *
 * @param {{startDate: Date, endDate: Date}} chargePeriod Charge period is determined as the overlap between a charge
 *  version's start and end dates, and the billing period's (financial year) start and end dates. So, when the charge
 *  version and billing period are compared the charge period's start date is the latest of the two, and the end date is
 *  the earliest of their end dates
 * @param {{startDate: Date, endDate: Date}} billingPeriod The period a billing batch is being calculated for.
 *  Currently, this always equates to a financial year, for example, 2022-04-01 to 2023-03-31
 * @param {module:ChargeElementModel} chargeElement Referred to as the 'charge reference' in the UI, for example,
 *  4.1.10. A charge version can have multiple charge elements, though each will have a different reference. Each
 *  element can have multiple charge purposes and it's these that hold the abstraction period data
 *
 * @returns {Object} An object containing an `authorisedDays` and `billableDays` property
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
 * Before we can calculate the days and whether a period should be considered, we have to assign actual years to the
 * charge purpose's abstraction start and end values.
 *
 * ## In-year
 *
 * An "in-year" abstraction period is one that starts and ends in the same year. It can be identified by the start day/
 * month being before the end day/month. For example, 10-Oct to 31-Dec.
 *
 * ## Out-year
 *
 * An "out-year" abstraction period is one that starts in one year and ends in the next. It can be identified by the
 * start day/month being *after* the end day/month. For example, 01-Nov to 31-Mar.
 *
 * To arrive at actual dates for an abstraction period, we start by creating dates based on the reference period's start
 * year. So if the reference period starts in 2022, our first period for the above examples would be:
 *
 * - **In-year abstraction period** 10-Oct-2022 to 31-Dec-2022
 * - **Out-year abstraction period** 01-Nov-2022 to 31-Mar-2023
 *
 * To ensure we cover all possible abstraction periods which the reference period could overlap, we then create
 * additional abstraction periods for the year before and the year after our first period:
 *
 * - **In-year abstraction periods** 10-Oct-2021 to 31-Dec-2021 and 10-Oct-2023 to 31-Oct-2023
 * - **Out-year abstraction periods** 01-Nov-2021 to 31-Mar-2022 and 01-Nov-2023 to 31-Mar-2024
 *
 * Finally, we filter out any of these abstraction periods which don't overlap with the reference period, and return the
 * results.
 *
 * @param {Object} referencePeriod either the billing period or charge period
 * @param {module:ChargePurposeModel} chargePurpose holds the abstraction start and end day and month values
 *
 * @returns {Object[]} An array of abstraction periods each containing a start and end date
 */
function _abstractionPeriods (referencePeriod, chargePurpose) {
  const periodStartYear = referencePeriod.startDate.getFullYear()
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = chargePurpose

  // Reminder! Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
  // January is actually 0, February is 1 etc. This is why we are always deducting 1 from the months.
  const firstPeriod = {
    startDate: new Date(periodStartYear, startMonth - 1, startDay),
    endDate: new Date(periodStartYear, endMonth - 1, endDay)
  }

  // Determine if this is an out-year abstraction period by checking whether the end date is before the start date. If
  // it is then adjust the end date to be in the next year.
  if (firstPeriod.endDate < firstPeriod.startDate) {
    firstPeriod.endDate = _addOneYear(firstPeriod.endDate)
  }

  // Create periods for the previous year and the following year, covering all possible abstraction periods that our
  // reference period could overlap
  const previousPeriod = {
    startDate: _subtractOneYear(firstPeriod.startDate),
    endDate: _subtractOneYear(firstPeriod.endDate)
  }
  const nextPeriod = {
    startDate: _addOneYear(firstPeriod.startDate),
    endDate: _addOneYear(firstPeriod.endDate)
  }

  // Filter out any periods which don't overlap our reference period to return the ones which do
  return [previousPeriod, firstPeriod, nextPeriod].filter((period) => {
    return _isPeriodValid(referencePeriod, period)
  })
}

/**
 * Calculates the numbers of days in an abstraction overlap period (inclusive)
 *
 * We uses JavaScript's
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime|getTime()}
 * function to give us the start and end time in milliseconds. We then take the difference and divide by how many
 * milliseconds are in a day. This gives us the number of days.
 *
 * Finally, we add 1 to the result to make it inclusive of the last day. This is because our dates are set at
 * midnight which means `endDate.getTime()` is the time at `endDate 00:00:00`.
 *
 * @param {Object} abstractionOverlapPeriod a start and end date representing the part of the abstraction period that
 * overlaps the reference period
 *
 * @returns {number} the length of the period in days (inclusive)
 */
function _calculateDays (abstractionOverlapPeriod) {
  const DAY_IN_MILLISECONDS = (24 * 60 * 60 * 1000) // (24 hrs * 60 mins * 60 secs * 1000 msecs)

  // difference in msecs
  const difference = abstractionOverlapPeriod.endDate.getTime() - abstractionOverlapPeriod.startDate.getTime()

  // ceil() always rounds up, even if the result is 1.1 (rounds to 2). We add 1 to make the calculation inclusive of
  // the last day
  return Math.ceil(difference / DAY_IN_MILLISECONDS) + 1
}

/**
 * Calculates the period that an abstraction period overlaps the reference period
 *
 * Before we can work out either the authorised or billable days, we first need to work out what part of the abstraction
 * period overlaps.
 *
 * The simplest way to look at this is that the overlapping period is the latest start date and the earliest end date.
 *
 * So, for example, the abstraction period has been calculated as 01-JAN-2022 to 30-JUN-2022 and our reference is the
 * billing period (ie. 31-MAR-2022 to 01-APR-2023). Then the overlap period is 01-APR-2022 to 30-JUN-2022.
 *
 * Other scenarios we have to handle are
 *
 * - 01-JUL-2022 to 31-DEC-2022 - overlap is also 01-JUL-2022 to 31-DEC-2022 because it falls inside the billing period
 * - 01-NOV-2022 to 31-MAY-2023 - overlap is 01-NOV-2022 to 31-MAR-2023
 *
 * @param {Object} referencePeriod either the billing period or charge period
 * @param {Object} abstractionPeriod an object containing `startDate` and `endDate` date representing the abstraction
 *  period relative to the reference
 *
 * @returns {Object} an object with a start and end date representing the part of the abstraction period that overlaps
 *  the reference period
 */
function _calculateAbstractionOverlapPeriod (referencePeriod, abstractionPeriod) {
  const latestStartDateTimestamp = Math.max(abstractionPeriod.startDate, referencePeriod.startDate)
  const earliestEndDateTimestamp = Math.min(abstractionPeriod.endDate, referencePeriod.endDate)

  return {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }
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
  // If one period starts after the other ends then there is no intersection
  if (
    abstractionPeriod.startDate > referencePeriod.endDate ||
    referencePeriod.startDate > abstractionPeriod.endDate
  ) {
    return false
  }

  return true
}

function _addOneYear (date) {
  return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
}

function _subtractOneYear (date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

module.exports = {
  go
}
