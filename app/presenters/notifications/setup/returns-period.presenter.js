'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { monthsAsIntegers } = require('../../../lib/static-lookups.lib')
const { formatLongDate } = require('../../base.presenter')

const currentPeriod = 'currentPeriod'
const nextPeriod = 'nextPeriod'
const twentyEighth = 28
const twentyNinth = 29
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
  } else if (_dayIsBetweenOctoberAndNovember(today)) {
    return _dayBetweenOctoberAndNovemberOptions(previousYear, currentYear, nextYear)
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
  return date.getMonth() === monthsAsIntegers.january && date.getDate() <= twentyEighth
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
  return (
    date.getMonth() === monthsAsIntegers.december ||
    (date.getMonth() === monthsAsIntegers.november && date.getDate() === twentyNinth)
  )
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

/*
 *  When the date is between 29th October - 28th November
 *
 * @returns {boolean} - true if date is in range (29th October - 28th November)
 */
function _dayIsBetweenOctoberAndNovember(date) {
  return (
    (date.getMonth() === monthsAsIntegers.october && date.getDate() === twentyNinth) ||
    (date.getMonth() === monthsAsIntegers.november && date.getDate() <= twentyEighth)
  )
}

function _dayBetweenOctoberAndNovemberOptions(previousYear, currentYear, nextYear) {
  return [
    _summerOptions(
      currentPeriod,
      new Date(`${previousYear}-11-01`),
      new Date(`${currentYear}-10-31`),
      new Date(`${currentYear}-11-28`)
    ),
    _quarterlyOptions(
      nextPeriod,
      new Date(`${currentYear}-10-01`),
      new Date(`${currentYear}-12-31`),
      new Date(`${nextYear}-${dueJanuary}`)
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

function _summerOptions(period, fromDate, toDate, dueDate) {
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
