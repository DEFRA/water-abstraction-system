'use strict'

/**
 * Used to calculate the abstraction volume for a return
 * @module CalculateAbstractionVolume
 */

function go (billingPeriod, returns) {
  for (const returnData of returns) {
    if (returnData.versions[0]?.nilReturn === true) {
      returnData.volume = 0
    }

    if (!returnData.versions[0]?.lines) {
      continue
    }

    // const totalQuantity = returnData.versions[0].lines.reduce((accumulator, line) => {
    //   if (line && line.quantity !== null) {
    //     return accumulator + (line.quantity || 0)
    //   }
    //   return accumulator
    // }, 0)
    const accumulatedReturnVolumes = {
      inPeriod: 0,
      outsidePeriod: 0
    }

    const abstractionPeriods = _abstractionPeriods(billingPeriod, returnData)
    console.log("🚀 ~ file: calculate-abstraction-volume.service.js:30 ~ go ~ billingPeriod:", billingPeriod)
    console.log("🚀 ~ file: calculate-abstraction-volume.service.js:30 ~ go ~ abstractionPeriods:", abstractionPeriods)

    const periods = abstractionPeriods.map((abstractionPeriod) => {
      return _calculateAbstractionOverlapPeriod(billingPeriod, abstractionPeriod)
    })
    console.log("🚀 ~ file: calculate-abstraction-volume.service.js:36 ~ periods ~ periods:", periods)

    for (const line of returnData.versions[0].lines) {
      if (line && line.quantity !== null) {
        if (line.startDate <= billingPeriod.endDate && line.endDate >= billingPeriod.startDate) {
          accumulatedReturnVolumes.inPeriod = accumulatedReturnVolumes.inPeriod + (line.quantity || 0)
        } else {
          accumulatedReturnVolumes.outsidePeriod = accumulatedReturnVolumes.outsidePeriod + (line.quantity || 0)
        }
      }
    }

    // returnData.volume = totalQuantity
    returnData.volume = accumulatedReturnVolumes
  }
}

function _abstractionPeriods (billingPeriod, returnData) {
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

function _addOneYear (date) {
  return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
}

function _subtractOneYear (date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
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

module.exports = {
  go
}
