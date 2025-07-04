'use strict'

/**
 * Formats data for the `/notices/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { determineUpcomingReturnPeriods } = require('../../../../lib/return-periods.lib.js')
const { formatLongDate } = require('../../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/returns-period` page
 *
 * @param {module:SessionModel} session - The session instance to format
 * @param {module:SessionModel} session.returnsPeriod - The returns period saved from a previous submission
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { referenceCode, journey } = session

  const savedReturnsPeriod = session.returnsPeriod ?? null

  return {
    backLink: '/manage',
    pageTitle: `Select the returns periods for the ${journey}`,
    referenceCode,
    returnsPeriod: _returnsPeriod(savedReturnsPeriod)
  }
}

function _returnsPeriod(savedReturnsPeriod) {
  const today = new Date()

  const [firstReturnPeriod, secondReturnPeriod] = determineUpcomingReturnPeriods(today)

  const currentReturnPeriod = _formatReturnPeriod(firstReturnPeriod, savedReturnsPeriod)
  const nextReturnPeriod = _formatReturnPeriod(secondReturnPeriod, savedReturnsPeriod)

  return [currentReturnPeriod, nextReturnPeriod]
}

function _formatReturnPeriod(returnsPeriod, savedReturnsPeriod) {
  const textPrefix = _textPrefix(returnsPeriod)
  return {
    value: returnsPeriod.name,
    text: `${textPrefix} ${formatLongDate(returnsPeriod.startDate)} to ${formatLongDate(returnsPeriod.endDate)}`,
    hint: {
      text: `Due date ${formatLongDate(returnsPeriod.dueDate)}`
    },
    checked: returnsPeriod.name === savedReturnsPeriod
  }
}

function _textPrefix(returnPeriod) {
  if (returnPeriod.name === 'allYear') {
    return 'Winter and all year annual'
  } else if (returnPeriod.name === 'summer') {
    return 'Summer annual'
  } else {
    return 'Quarterly'
  }
}

module.exports = {
  go
}
