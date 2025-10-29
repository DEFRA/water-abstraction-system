'use strict'

/**
 * Formats data for the `/notices/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

const { determineUpcomingReturnPeriods } = require('../../../../lib/return-periods.lib.js')
const { formatLongDate } = require('../../../base.presenter.js')
const { returnsPeriodText } = require('../../base.presenter.js')
const { today } = require('../../../../lib/general.lib.js')

/**
 * Formats data for the `/notices/setup/returns-period` page
 *
 * @param {module:SessionModel} session - The session instance to format
 * @param {module:SessionModel} session.returnsPeriod - The returns period saved from a previous submission
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { checkPageVisited, noticeType, id: sessionId } = session

  const savedReturnsPeriod = session.returnsPeriod ?? null

  return {
    backLink: _backLink(sessionId, checkPageVisited),
    pageTitle: `Select the returns periods for the ${noticeType}`,
    returnsPeriod: _returnsPeriod(savedReturnsPeriod)
  }
}

function _backLink(sessionId, checkPageVisited) {
  if (checkPageVisited) {
    return {
      href: `/system/notices/setup/${sessionId}/check-notice-type`,
      text: 'Back'
    }
  }

  return {
    href: `/system/notices/setup/${sessionId}/notice-type`,
    text: 'Back'
  }
}

function _returnsPeriod(savedReturnsPeriod) {
  const [firstReturnPeriod, secondReturnPeriod] = determineUpcomingReturnPeriods(today())

  const currentReturnPeriod = _formatReturnPeriod(firstReturnPeriod, savedReturnsPeriod)
  const nextReturnPeriod = _formatReturnPeriod(secondReturnPeriod, savedReturnsPeriod)

  return [currentReturnPeriod, nextReturnPeriod]
}

function _formatReturnPeriod(returnsPeriod, savedReturnsPeriod) {
  return {
    value: returnsPeriod.name,
    text: returnsPeriodText(returnsPeriod),
    hint: {
      text: `Due date ${formatLongDate(returnsPeriod.dueDate)}`
    },
    checked: returnsPeriod.name === savedReturnsPeriod
  }
}

module.exports = {
  go
}
