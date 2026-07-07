/**
 * Formats data for the `/notices/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

import { determineUpcomingReturnPeriods } from '../../../lib/return-periods.lib.js'
import { formatLongDate } from '../../base.presenter.js'
import { returnsPeriodText } from '../base.presenter.js'
import { today } from '../../../lib/general.lib.js'

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

export {
  go
}
export default {
  go
}
