'use strict'

/**
 * Used to calculate the abstraction volumes for the given returns
 * @module CalculateReturnsVolumes
 */

function go (billingPeriod, returns) {
  returns.forEach((returnData) => {
    const lines = returnData?.versions[0]?.lines ? returnData?.versions[0]?.lines : []

    let billableAbstractionPeriods = []
    if (lines) {
      billableAbstractionPeriods = _billableAbstractionPeriods(billingPeriod, returnData)
    }

    returnData.volumes = _calculateReturnLinesVolumes(lines, billableAbstractionPeriods)
  })
}

function _calculateReturnLinesVolumes (lines, billableAbstractionPeriods) {
  const inPeriodLines = []
  const outsidePeriodLines = []

  lines.forEach((line) => {
    if (!line.quantity) {
      return
    }

    const isInsideBillablePeriod = billableAbstractionPeriods.some((period) => {
      return (line.startDate <= period.endDate && line.endDate >= period.startDate)
    })

    if (isInsideBillablePeriod) {
      inPeriodLines.push(line)
    } else {
      outsidePeriodLines.push(line)
    }
  })

  return {
    inPeriod: _totalLineQuantities(inPeriodLines),
    outsidePeriod: _totalLineQuantities(outsidePeriodLines)
  }
}

function _addOneYear (date) {
  return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
}

function _billableAbstractionPeriods (billingPeriod, returnData) {
  const abstractionPeriodsWithYears = _determineAbstractionPeriodYears(billingPeriod, returnData)

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

function _determineAbstractionPeriodYears (billingPeriod, returnData) {
  const periodStartYear = billingPeriod.startDate.getFullYear()
  const startDay = returnData.metadata.nald.periodStartDay
  const startMonth = returnData.metadata.nald.periodStartMonth
  const endDay = returnData.metadata.nald.periodEndDay
  const endMonth = returnData.metadata.nald.periodEndMonth

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

function _totalLineQuantities (lines) {
  return lines.reduce((accumulator, line) => {
    return accumulator + line.quantity
  }, 0)
}

function _subtractOneYear (date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

module.exports = {
  go
}
