'use strict'

/**
 * Calculates authorised and billable days for a given charge element
 * @module CalculateAuthorisedAndBillableDaysService
 */

const ConsolidateDateRangesService = require('./consolidate-date-ranges.service.js')

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

function _calculateDays (abstractionPeriod) {
  const DAY_IN_MILLISECONDS = (24 * 60 * 60 * 1000) // (24 hrs * 60 mins * 60 secs * 1000 msecs)
  if (abstractionPeriod.overlapStartDate) {
    const difference = abstractionPeriod.overlapEndDate.getTime() - abstractionPeriod.overlapStartDate.getTime() // difference in msecs
    const days = Math.ceil(difference / DAY_IN_MILLISECONDS) + 1
    abstractionPeriod.days = days
  }
}

function _calculateOverlapPeriod (referencePeriod, abstractionPeriod) {
  let overlapStartDate
  let overlapEndDate

  if (abstractionPeriod.startDate < referencePeriod.startDate) {
    overlapStartDate = referencePeriod.startDate
  } else {
    overlapStartDate = abstractionPeriod.startDate
  }

  if (abstractionPeriod.endDate > referencePeriod.endDate) {
    overlapEndDate = referencePeriod.endDate
  } else {
    overlapEndDate = abstractionPeriod.endDate
  }

  if (overlapStartDate <= overlapEndDate) {
    abstractionPeriod.overlapStartDate = overlapStartDate
    abstractionPeriod.overlapEndDate = overlapEndDate
  }
}

function _consolidateAndCalculate (referencePeriod, abstractionsPeriods) {
  const consolidatedAbstractionPeriods = ConsolidateDateRangesService.go(abstractionsPeriods)

  for (const abstractionPeriod of consolidatedAbstractionPeriods) {
    _calculateOverlapPeriod(referencePeriod, abstractionPeriod)
    _calculateDays(abstractionPeriod)
  }

  return consolidatedAbstractionPeriods.reduce((accumulator, abstractionPeriod) => {
    return accumulator + abstractionPeriod.days
  }, 0)
}

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
