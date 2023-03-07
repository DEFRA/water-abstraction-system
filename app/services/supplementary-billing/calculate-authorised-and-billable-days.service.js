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
    _calculateBillablePeriod(billingPeriod, authorisedPeriod)
    _calculateDays(authorisedPeriod)
  }

  for (const billablePeriod of consolidatedBillablePeriods) {
    _calculateBillablePeriod(chargePeriod, billablePeriod)
    _calculateDays(billablePeriod)
  }

  result.authorisedDays = consolidatedAuthorisedPeriods.reduce((accumulator, period) => {
    return accumulator + period.days
  }, 0)

  result.billableDays = consolidatedBillablePeriods.reduce((accumulator, period) => {
    return accumulator + period.days
  }, 0)

  return result
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
  if (abstractionPeriod.billableStartDate) {
    const difference = abstractionPeriod.billableEndDate.getTime() - abstractionPeriod.billableStartDate.getTime() // difference in msecs
    const days = Math.ceil(difference / DAY_IN_MILLISECONDS) + 1
    abstractionPeriod.days = days
  }
}

function _calculateBillablePeriod (referencePeriod, abstractionPeriod) {
  let billableStartDate
  let billableEndDate

  if (abstractionPeriod.startDate < referencePeriod.startDate) {
    billableStartDate = referencePeriod.startDate
  } else {
    billableStartDate = abstractionPeriod.startDate
  }

  if (abstractionPeriod.endDate > referencePeriod.endDate) {
    billableEndDate = referencePeriod.endDate
  } else {
    billableEndDate = abstractionPeriod.endDate
  }

  if (billableStartDate <= billableEndDate) {
    abstractionPeriod.billableStartDate = billableStartDate
    abstractionPeriod.billableEndDate = billableEndDate
  }
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
