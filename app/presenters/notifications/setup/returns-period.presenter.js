'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { monthsAsIntegers } = require('../../../lib/static-lookups.lib')

const currentPeriod = 'currentPeriod'
const nextPeriod = 'nextPeriod'
const twentyEighth = 28
const twentyNinth = 29

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
    {
      value: currentPeriod,
      text: `Quarterly 1st October ${previousYear} to 31st December ${previousYear}`,
      hint: {
        text: `Due date 28 Jan ${currentYear}`
      }
    },
    {
      value: nextPeriod,
      text: `Quarterly 1st January ${currentYear} to 31st March ${currentYear}`,
      hint: {
        text: `Due date 28 April ${currentYear}`
      }
    }
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
    {
      value: currentPeriod,
      text: `Quarterly 1st October ${currentYear} to 31st December ${currentYear}`,
      hint: {
        text: `Due date 28 Jan ${nextYear}`
      }
    },
    {
      value: nextPeriod,
      text: `Quarterly 1st January ${nextYear} to 31st March ${nextYear}`,
      hint: {
        text: `Due date 28 April ${nextYear}`
      }
    }
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
    {
      value: currentPeriod,
      text: `Summer annual 1st November ${previousYear} to 31st October ${currentYear}`,
      hint: {
        text: `Due date 28 November ${currentYear}`
      }
    },
    {
      value: nextPeriod,
      text: `Quarterly 1st October ${currentYear} to 31st December ${currentYear}`,
      hint: {
        text: `Due date 28 January ${nextYear}`
      }
    }
  ]
}

module.exports = {
  go
}
