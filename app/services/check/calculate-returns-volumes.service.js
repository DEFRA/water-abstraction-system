'use strict'

/**
 * Used to calculate the abstraction volumes for the given return logs
 * @module CalculateReturnsVolumes
 */

function go (billingPeriod, returnLogs) {
  returnLogs.forEach((returnLogData) => {
    const returnSubmissionLines = returnLogData?.returnSubmissions[0]?.returnSubmissionLines ? returnLogData?.returnSubmissions[0]?.returnSubmissionLines : []

    let billableAbstractionPeriods = []
    if (returnSubmissionLines) {
      billableAbstractionPeriods = _billableAbstractionPeriods(billingPeriod, returnLogData)
    }

    returnLogData.volumes = _calculateReturnLinesVolumes(returnSubmissionLines, billableAbstractionPeriods)
  })
}

function _calculateReturnLinesVolumes (returnSubmissionLines, billableAbstractionPeriods) {
  const inPeriodLines = []
  const outsidePeriodLines = []

  returnSubmissionLines.forEach((returnSubmissionLine) => {
    if (!returnSubmissionLine.quantity) {
      return
    }

    const isInsideBillablePeriod = billableAbstractionPeriods.some((period) => {
      return (returnSubmissionLine.startDate <= period.endDate && returnSubmissionLine.endDate >= period.startDate)
    })

    if (isInsideBillablePeriod) {
      inPeriodLines.push(returnSubmissionLine)
    } else {
      outsidePeriodLines.push(returnSubmissionLine)
    }
  })

  const inPeriod = _totalLineQuantities(inPeriodLines)
  const outsidePeriod = _totalLineQuantities(outsidePeriodLines)
  const total = inPeriod + outsidePeriod

  return {
    inPeriod,
    outsidePeriod,
    total
  }
}

function _addOneYear (date) {
  return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
}

function _billableAbstractionPeriods (billingPeriod, returnLogData) {
  const abstractionPeriodsWithYears = _determineAbstractionPeriodYears(billingPeriod, returnLogData)

  return abstractionPeriodsWithYears.map((abstractionPeriod) => {
    return _calculateAbstractionOverlapPeriod(billingPeriod, abstractionPeriod)
  })
}

function _calculateAbstractionOverlapPeriod (billingPeriod, abstractionPeriod) {
  const latestStartDateTimestamp = Math.max(abstractionPeriod.startDate, billingPeriod.startDate)
  const earliestEndDateTimestamp = Math.min(abstractionPeriod.endDate, billingPeriod.endDate)

  return {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }
}

function _determineAbstractionPeriodYears (billingPeriod, returnLogData) {
  const periodStartYear = billingPeriod.startDate.getFullYear()
  const startDay = returnLogData.metadata.nald.periodStartDay
  const startMonth = returnLogData.metadata.nald.periodStartMonth
  const endDay = returnLogData.metadata.nald.periodEndDay
  const endMonth = returnLogData.metadata.nald.periodEndMonth

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
  return [previousPeriod, firstPeriod, nextPeriod].filter((abstractionPeriod) => {
    return _isPeriodValid(billingPeriod, abstractionPeriod)
  })
}

function _isPeriodValid (billingPeriod, abstractionPeriod) {
  // If one period starts after the other ends then there is no intersection
  if (
    abstractionPeriod.startDate > billingPeriod.endDate ||
    billingPeriod.startDate > abstractionPeriod.endDate
  ) {
    return false
  }

  return true
}

function _totalLineQuantities (returnSubmissionLines) {
  return returnSubmissionLines.reduce((accumulator, returnSubmissionLine) => {
    return accumulator + returnSubmissionLine.quantity
  }, 0)
}

function _subtractOneYear (date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

module.exports = {
  go
}
