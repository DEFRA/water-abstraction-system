'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { formatLongDate } = require('../../base.presenter')
const { isDateBetweenRange } = require('../../../lib/dates.lib')
const { returnCycleDates } = require('../../../lib/static-lookups.lib')

const currentPeriod = 'currentPeriod'
const nextPeriod = 'nextPeriod'

const january = 0
const dates = {
  dueAprilDate: '04-28',
  dueJanuaryDate: '01-28',
  januaryFirst: '01-01',
  marchThirtyFirst: '03-31',
  octoberFirst: '10-01',
  octoberTwentyNinth: '10-29',
  octoberThirtyFirst: '10-31',
  novemberFirst: '11-01',
  novemberTwentyEighth: '11-28',
  novemberTwentyNinth: '11-29',
  decemberThirtyFirst: '12-31'
}

// 8 things -
// take in today - calculate the next two
// next two due dates -

// full year and q4 the same due date - (only full year include q4 - should already)

// on q4 - use the all year not he q4 - use the full year

// take to day and get next two due dates -

// All year
// Full year - 1/04/25 - 31/03/26 - 28/04/26
// Q1 1/04/25 - 30/06/25 - 28/07/25
// Q2 1/07/25  - 31/09/25 - 28/10/25
// Q3 1/10/25 - 31/12/25 - 28/01/26 -
// Q4 1/01/26 - 31/03/26 - 28/04/26
//
// Summer
// Full year - 1/11/26 - 31/10/27 - 28/11/27
// Q1 1/11/26 - 31/01/26 - 28/02/26 -
// Q2 1/02/27 - 30/04/27 - 28/05/27
// Q3 1/05/27 - 31/07/27 - 28/08/27
// Q4 1/08/27 - 31/10/27 - 28/11/27

const options = {
  summer: {
    value: 'summer',
    getDates() {
      const today = new Date()
      return {
        dueDate: new Date(`${today.getFullYear()}-${dates.novemberTwentyEighth}`),
        endDate: new Date(`${today.getFullYear()}-${dates.octoberThirtyFirst}`),
        startDate: new Date(`${today.getFullYear() - 1}-${dates.novemberFirst}`)
      }
    }
  }
}

/**
 * Formats data for the `/notifications/setup/returns-period` page
 *
 * @returns {object} - The data formatted for the view template
 */
function go() {
  return {
    backLink: '/manage',
    returnsPeriod: _returnsPeriod()
  }
}

function _returnsPeriod() {
  const today = new Date()

  if (_dayIsInQuarterOne(today)) {
    return _dayInQuarterOne(today)
  } else if (_dayIsBetweenOctoberAndNovember(today)) {
    return _dayBetweenOctoberAndNovemberOptions(today)
  } else {
    return []
  }
}

/**
 * Checks if a day is quarter one
 * This logic differs from normal quarters as it spans across a year
 *
 * To handle this span the function adds / subtracts a year from the star or end date
 *
 * @param {Date} date - the date to check is in quarter one
 *
 * @returns {boolean} - true if date is in the range (11 November - 28 January)
 *
 * @private
 */
function _dayIsInQuarterOne(date) {
  const year = date.getFullYear()

  let startDate = new Date(`${year}-${dates.novemberTwentyNinth}`)
  let endDate = new Date(`${year}-${dates.dueJanuaryDate}`)

  if (date.getMonth() !== january) {
    endDate = new Date(`${year + 1}-${dates.dueJanuaryDate}`)
  } else {
    startDate = new Date(`${year - 1}-${dates.novemberTwentyNinth}`)
  }

  return isDateBetweenRange(date, startDate, endDate)
}

/**
 * When the date is between 29th October - 28th November
 *
 * @param date
 *
 * @returns {boolean} - true if date is in range (29th October - 28th November)
 *
 * @private
 */
function _dayIsBetweenOctoberAndNovember(date) {
  const octoberTwentyNinth = new Date(`${date.getFullYear()}-${dates.octoberTwentyNinth}`)
  const novemberTwentyEighth = new Date(`${date.getFullYear()}-${dates.novemberTwentyEighth}`)
  return isDateBetweenRange(date, octoberTwentyNinth, novemberTwentyEighth)
}

/**
 * When a date is in quarter one there are some alternations to the options depending on the date
 *
 * If the date is in January then the years shown differ from those before January
 *
 * @param {Date} date -
 *
 * @returns {object} - the return period options
 *
 * @private
 */
function _dayInQuarterOne(date) {
  const currentYear = date.getFullYear()
  const previousYear = currentYear - 1
  const nextYear = currentYear + 1

  if (date.getMonth() === january) {
    return [_octToDecQuarter(currentPeriod, previousYear, currentYear), _janToMarchQuarter(nextPeriod, currentYear)]
  } else {
    return [_octToDecQuarter(currentPeriod, currentYear, nextYear), _janToMarchQuarter(nextPeriod, nextYear)]
  }
}

function _dayBetweenOctoberAndNovemberOptions(date) {
  const currentYear = date.getFullYear()
  const nextYear = currentYear + 1
  return [_summerOptions(currentPeriod, date), _octToDecQuarter(nextPeriod, currentYear, nextYear)]
}

function _janToMarchQuarter(period, year) {
  return _quarterlyOptions(
    period,
    new Date(`${year}-${dates.januaryFirst}`),
    new Date(`${year}-${dates.marchThirtyFirst}`),
    new Date(`${year}-${dates.dueAprilDate}`)
  )
}

function _octToDecQuarter(period, toYear, dueYear) {
  return _quarterlyOptions(
    period,
    new Date(`${toYear}-${dates.octoberFirst}`),
    new Date(`${toYear}-${dates.decemberThirtyFirst}`),
    new Date(`${dueYear}-${dates.dueJanuaryDate}`)
  )
}

function _quarterlyOptions(period, fromDate, toDate, dueDate) {
  return {
    value: period,
    text: `Quarterly ${formatLongDate(fromDate)} to ${formatLongDate(toDate)}`,
    hint: {
      text: `Due date ${formatLongDate(dueDate)}`
    }
  }
}

function _summerOptions(period, date) {
  const { startDate, endDate, dueDate } = options.summer.getDates()
  return {
    value: options.summer.value,
    text: `Summer annual ${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    hint: {
      text: `Due date ${formatLongDate(dueDate)}`
    }
  }
}

module.exports = {
  go
}
