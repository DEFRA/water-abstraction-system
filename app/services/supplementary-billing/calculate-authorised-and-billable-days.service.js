'use strict'

const ConsolidateDateRangesService = require('./consolidate-date-ranges.service.js')

function go (chargePeriod, billingPeriod, chargeElement) {
  const { chargePurposes } = chargeElement
  const result = {
    // authorisedDays is the number of overlapping days of the billing period and the charge element's abstraction
    // periods
    authorisedDays: 0,
    // billableDays is the number of overlapping days of the charge period and the charge element's abstraction periods
    billableDays: 0
  }

  const authorisedAbstractionPeriods = []
  const billableAbstractionPeriods = []

  for (const chargePurpose of chargePurposes) {
    authorisedAbstractionPeriods.push(..._abstractionPeriods(billingPeriod, chargePurpose))
    billableAbstractionPeriods.push(..._abstractionPeriods(chargePeriod, chargePurpose))
  }

  const consolidatedAuthorisedPeriods = ConsolidateDateRangesService.go(authorisedAbstractionPeriods)
  const consolidatedBillablePeriods = ConsolidateDateRangesService.go(billableAbstractionPeriods)

  for (const authorisedPeriod of consolidatedAuthorisedPeriods) {
    _calculateBillablePeriod(authorisedPeriod, billingPeriod)
    _calculateBillableDays(authorisedPeriod)
  }

  for (const billablePeriod of consolidatedBillablePeriods) {
    _calculateBillablePeriod(billablePeriod, chargePeriod)
    _calculateBillableDays(billablePeriod)
  }

  result.authorisedDays = consolidatedAuthorisedPeriods.reduce((accumulator, period) => {
    return accumulator + period.billableDays
  }, 0)

  result.billableDays = consolidatedBillablePeriods.reduce((accumulator, period) => {
    return accumulator + period.billableDays
  }, 0)

  return result
}

function _abstractionPeriods (period, chargePurpose) {
  const periodStartYear = period.startDate.getFullYear()
  const periodEndYear = period.endDate.getFullYear()
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
  if (_isPeriodValid(period, previousPeriod)) {
    abstractionPeriods.push(previousPeriod)
  }

  if (_isPeriodValid(period, firstPeriod)) {
    abstractionPeriods.push(firstPeriod)
  }

  return abstractionPeriods
}

function _calculateBillableDays (abstractionPeriod) {
  const DAY_IN_MILLISECONDS = (24 * 60 * 60 * 1000) // (24 hrs * 60 mins * 60 secs * 1000 msecs)
  if (abstractionPeriod.billableStartDate) {
    const difference = abstractionPeriod.billableEndDate.getTime() - abstractionPeriod.billableStartDate.getTime() // difference in msecs
    const billableDays = Math.ceil(difference / DAY_IN_MILLISECONDS) + 1
    abstractionPeriod.billableDays = billableDays
  }
}

function _calculateBillablePeriod (abstractionPeriod, billingPeriod) {
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

function _isPeriodValid (billingPeriod, abstractionPeriod) {
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
