'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

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

  if (_dayIsInJanuary(today)) {
    return _dayIsInJanuaryOptions(currentYear, previousYear)
  }

  return []
}

/*
 *  Checks if a date is in January
 *  A date is in January if it is between 1st January - 28th January
 */
function _dayIsInJanuary(date) {
  return date.getMonth() === 0 && date.getDate() >= 1 && date.getDate() <= 28
}

function _dayIsInJanuaryOptions(currentYear, previousYear) {
  return [
    {
      value: 'quarterlyJanToMarch',
      text: `Quarterly 1st October ${previousYear} to 31st December ${previousYear}`,
      hint: {
        text: `Due date 28 Jan ${currentYear}`
      }
    },
    {
      value: 'quarterlyAprilToMarch',
      text: `Quarterly 1st January ${currentYear} to 31st March ${currentYear}`,
      hint: {
        text: `Due date 28 April ${currentYear}`
      }
    }
  ]
}

module.exports = {
  go
}
