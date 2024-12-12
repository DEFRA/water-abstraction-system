'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib')
const { formatLongDate } = require('../../base.presenter')

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

  const [currentReturnPeriod, nextReturnPeriod] = determineUpcomingReturnPeriods(today)

  const current = currentReturnPeriod.name !== 'summer' ? _quarter(currentReturnPeriod) : _summer(currentReturnPeriod)
  const next = nextReturnPeriod.name !== 'summer' ? _quarter(nextReturnPeriod) : _summer(nextReturnPeriod)
  return [current, next]
}

function _quarter(returnPeriod) {
  return {
    value: returnPeriod.name,
    text: `Quarterly ${formatLongDate(returnPeriod.startDate)} to ${formatLongDate(returnPeriod.endDate)}`,
    hint: {
      text: `Due date ${formatLongDate(returnPeriod.dueDate)}`
    }
  }
}

function _summer(returnPeriod) {
  return {
    value: returnPeriod.name,
    text: `Summer annual ${formatLongDate(returnPeriod.startDate)} to ${formatLongDate(returnPeriod.endDate)}`,
    hint: {
      text: `Due date ${formatLongDate(returnPeriod.dueDate)}`
    }
  }
}

module.exports = {
  go
}
