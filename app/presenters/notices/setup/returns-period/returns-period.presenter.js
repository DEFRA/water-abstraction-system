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
  const { referenceCode, noticeType, id: sessionId } = session

  const savedReturnsPeriod = session.returnsPeriod ?? null

  return {
    backLink: {
      href: `/system/notices/setup/${sessionId}/notice-type`,
      text: 'Back'
    },
    pageTitle: `Select the returns periods for the ${noticeType}`,
    pageTitleCaption: `Notice ${referenceCode}`,
    returnsPeriod: _returnsPeriod(savedReturnsPeriod)
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
