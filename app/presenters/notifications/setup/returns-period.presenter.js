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

  const currentOption = _option(currentReturnPeriod)
  const nextOption = _option(nextReturnPeriod)

  return [currentOption, nextOption]
}

function _option(returnPeriod) {
  const textPrefix = _textPrefix(returnPeriod)
  return {
    value: returnPeriod.name,
    text: `${textPrefix} ${formatLongDate(returnPeriod.startDate)} to ${formatLongDate(returnPeriod.endDate)}`,
    hint: {
      text: `Due date ${formatLongDate(returnPeriod.dueDate)}`
    }
  }
}

function _textPrefix(returnPeriod) {
  if (returnPeriod.name === 'allYear') {
    return 'Winter and all year'
  } else if (returnPeriod.name === 'summer') {
    return 'Summer annual'
  } else {
    return 'Quarterly'
  }
}

module.exports = {
  go
}
