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
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    backLink: '/manage',
    returnsPeriod: _returnsPeriod(session)
  }
}

function _returnsPeriod(session) {
  const today = new Date()

  const [firstReturnPeriod, secondReturnPeriod] = determineUpcomingReturnPeriods(today)

  const currentReturnPeriod = _formatReturnPeriod(firstReturnPeriod, session)
  const nextReturnPeriod = _formatReturnPeriod(secondReturnPeriod, session)

  return [currentReturnPeriod, nextReturnPeriod]
}

function _formatReturnPeriod(returnsPeriod, session) {
  const textPrefix = _textPrefix(returnsPeriod)
  return {
    value: returnsPeriod.name,
    text: `${textPrefix} ${formatLongDate(returnsPeriod.startDate)} to ${formatLongDate(returnsPeriod.endDate)}`,
    hint: {
      text: `Due date ${formatLongDate(returnsPeriod.dueDate)}`
    },
    checked: returnsPeriod.name === session?.returnsPeriod
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
