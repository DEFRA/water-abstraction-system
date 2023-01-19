'use strict'

/**
 * Calculates billing periods needed when generating a supplementary bill run
 * @module AbstractionBillingPeriodService
 */

function go (billingPeriod, chargePurpose) {
  const abstractionPeriods = _abstractionPeriods(billingPeriod, chargePurpose)

  _flagPeriodsForConsideration(billingPeriod, abstractionPeriods)

  _calculateBillableDays(abstractionPeriods)

  return abstractionPeriods
}

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

function _calculateBillableDays (abstractionPeriods) {
  let difference
  let billableDays
  for (const abstractionPeriod of abstractionPeriods) {
    difference = abstractionPeriod.endDate.getTime() - abstractionPeriod.startDate.getTime() // difference in msecs
    billableDays = Math.ceil(difference / (1000 * 3600 * 24)) + 1 // (1000 msecs * (60 secs * 60 mins) * 24 hrs)
    abstractionPeriod.billableDays = billableDays
  }
}

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
