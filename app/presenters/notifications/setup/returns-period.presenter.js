'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { formatLongDate } = require('../../base.presenter')
const { isDateBetweenRange } = require('../../../lib/dates.lib')

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
  const currentYear = date.getFullYear()
  const previousYear = currentYear - 1

  const fromDate = new Date(`${previousYear}-${dates.novemberFirst}`)
  const toDate = new Date(`${currentYear}-${dates.octoberThirtyFirst}`)
  const dueDate = new Date(`${currentYear}-${dates.novemberTwentyEighth}`)

  return {
    value: period,
    text: `Summer annual ${formatLongDate(fromDate)} to ${formatLongDate(toDate)}`,
    hint: {
      text: `Due date ${formatLongDate(dueDate)}`
    }
  }
}

module.exports = {
  go
}
