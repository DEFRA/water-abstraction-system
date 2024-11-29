'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { formatLongDate } = require('../../base.presenter')

const currentPeriod = 'currentPeriod'
const nextPeriod = 'nextPeriod'

const dueApril = '04-28'
const dueJanuary = '01-28'

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
  const currentYear = today.getFullYear()
  const previousYear = currentYear - 1
  const nextYear = currentYear + 1

  if (_dayIsInJanuary(today)) {
    return _dayInJanuaryOptions(currentYear, previousYear)
  } else if (_dayIsBetweenNovemberAndDecember(today)) {
    return _dayBetweenNovemberAndDecemberOptions(currentYear, nextYear)
  } else {
    return []
  }
}

/*
 *  Checks if a date is in January (Before the 29th)
 *
 *  A date is in January if it is between 1st January - 28th January
 */
function _dayIsInJanuary(date) {
  const startDate = new Date(date.getFullYear(), 0, 1) // January 1
  const endDate = new Date(date.getFullYear(), 0, 28) // January 28

  return _isDateBetween(date, startDate, endDate)
}

function _dayInJanuaryOptions(currentYear, previousYear) {
  return [
    _quarterlyOptions(
      currentPeriod,
      new Date(`${previousYear}-10-01`),
      new Date(`${previousYear}-12-31`),
      new Date(`${currentYear}-${dueJanuary}`)
    ),
    _quarterlyOptions(
      nextPeriod,
      new Date(`${currentYear}-01-01`),
      new Date(`${currentYear}-03-31`),
      new Date(`${currentYear}-${dueApril}`)
    )
  ]
}

/*
 *  When the date is between 29th November - 31st December
 *
 * @returns {boolean} - true if date is in range (29th November - 31st December)
 */
function _dayIsBetweenNovemberAndDecember(date) {
  const startDate = new Date(date.getFullYear(), 10, 29) // November 29
  const endDate = new Date(date.getFullYear(), 11, 31) // December 31

  return _isDateBetween(date, startDate, endDate)
}

function _dayBetweenNovemberAndDecemberOptions(currentYear, nextYear) {
  return [
    _quarterlyOptions(
      currentPeriod,
      new Date(`${currentYear}-10-01`),
      new Date(`${currentYear}-12-31`),
      new Date(`${nextYear}-${dueJanuary}`)
    ),
    _quarterlyOptions(
      nextPeriod,
      new Date(`${nextYear}-01-01`),
      new Date(`${nextYear}-03-31`),
      new Date(`${nextYear}-${dueApril}`)
    )
  ]
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

function _isDateBetween(targetDate, startDate, endDate) {
  const target = new Date(targetDate).getTime()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  return target >= start && target <= end
}

module.exports = {
  go
}
