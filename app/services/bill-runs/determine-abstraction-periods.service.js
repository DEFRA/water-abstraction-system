'use strict'

/**
 * Helper methods to deal with abstraction periods
 * @module AbstractionPeriodLib
 */

/**
 * Determine real abstraction periods with years based on a reference period
 *
 * Abstraction periods on both charge elements and returns are held as just days and months, for example, '1st May to 31
 * Oct'. When we come to calculate billable days or attempt to match a return line to an element, we need to translate
 * them into real dates to do so.
 *
 * We use a reference period, typically a billing or charge period to determine what years to use. For example if the
 * `referencePeriod` is a billing period, it will be '1 April 2023 to 31 March 2024'. This function will then apply 2023
 * and 2024 to the provided abstraction period depending on whether it is an "in-year" or "out-year" abstraction period.
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
 * @param {object} referencePeriod - either the billing period or charge period
 * @param {number} startDay - the abstraction start day value
 * @param {number} startMonth - the abstraction start month value
 * @param {number} endDay - the abstraction end day value
 * @param {number} endMonth - the abstraction end month value
 *
 * @returns {object[]} An array of abstraction periods each containing a start and end date
 */
function determineAbstractionPeriods(referencePeriod, startDay, startMonth, endDay, endMonth) {
  const abstractionPeriodsWithYears = _determineYears(referencePeriod, startDay, startMonth, endDay, endMonth)

  return abstractionPeriodsWithYears.map((abstractionPeriod) => {
    return _calculateAbstractionOverlapPeriod(referencePeriod, abstractionPeriod)
  })
}

function _addOneYear(date) {
  return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
}

function _calculateAbstractionOverlapPeriod(referencePeriod, abstractionPeriod) {
  const latestStartDateTimestamp = Math.max(abstractionPeriod.startDate, referencePeriod.startDate)
  const earliestEndDateTimestamp = Math.min(abstractionPeriod.endDate, referencePeriod.endDate)

  return {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }
}

function _determineYears(referencePeriod, startDay, startMonth, endDay, endMonth) {
  const periodStartYear = referencePeriod.startDate.getFullYear()

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

  // Filter out any periods which don't overlap our reference period and return the ones which do
  return [previousPeriod, firstPeriod, nextPeriod].filter((abstractionPeriod) => {
    return _isPeriodValid(referencePeriod, abstractionPeriod)
  })
}

function _isPeriodValid(referencePeriod, abstractionPeriod) {
  // If either period starts after the other ends then there is no intersection and `false` is returned
  return !(
    abstractionPeriod.startDate > referencePeriod.endDate || referencePeriod.startDate > abstractionPeriod.endDate
  )
}

function _subtractOneYear(date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

module.exports = {
  determineAbstractionPeriods
}
