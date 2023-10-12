'use strict'

/**
 * Determine the abstraction period
 * @module DetermineAbstractionPeriodService
 */

function go (referencePeriod, startDay, startMonth, endDay, endMonth) {
  const abstractionPeriodsWithYears = _determineYears(referencePeriod, startDay, startMonth, endDay, endMonth)

  return abstractionPeriodsWithYears.map((abstractionPeriod) => {
    return _calculateAbstractionOverlapPeriod(referencePeriod, abstractionPeriod)
  })
}

function _addOneYear (date) {
  return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
}

function _calculateAbstractionOverlapPeriod (referencePeriod, abstractionPeriod) {
  const latestStartDateTimestamp = Math.max(abstractionPeriod.startDate, referencePeriod.startDate)
  const earliestEndDateTimestamp = Math.min(abstractionPeriod.endDate, referencePeriod.endDate)

  return {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }
}

function _determineYears (referencePeriod, startDay, startMonth, endDay, endMonth) {
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

function _subtractOneYear (date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

module.exports = {
  go
}
