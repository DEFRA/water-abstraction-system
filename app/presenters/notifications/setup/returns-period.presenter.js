'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { formatLongDate } = require('../../base.presenter')
const { currentReturnPeriod, nextReturnPeriod } = require('../../../lib/return-cycle-dates.lib')

const currentPeriod = 'currentPeriod'
const nextPeriod = 'nextPeriod'

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

  const currentReturnPeriodData = currentReturnPeriod(today)
  const nextReturnPeriodData = nextReturnPeriod(today)

  return [_Options(currentReturnPeriodData), _Options(nextReturnPeriodData)]
}

function _Options(data) {
  const type = data.name.includes('Quarter') ? 'Quarterly' : 'Summer annual'
  return {
    value: data.name,
    text: `${type} ${formatLongDate(data.startDate)} to ${formatLongDate(data.endDate)}`,
    hint: {
      text: `Due date ${formatLongDate(data.dueDate)}`
    }
  }
}

module.exports = {
  go
}
