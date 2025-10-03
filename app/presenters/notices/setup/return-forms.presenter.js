'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/return-forms` page
 * @module ReturnFormsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/return-forms` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { checkPageVisited, dueReturns, id: sessionId, selectedReturns } = session

  return {
    backLink: { href: _backLink(sessionId, checkPageVisited), text: 'Back' },
    pageTitle: 'Select the returns for the paper forms',
    returns: _returns(dueReturns, selectedReturns)
  }
}

function _backLink(sessionId, checkPageVisited) {
  if (checkPageVisited) {
    return `/system/notices/setup/${sessionId}/check-notice-type`
  }

  return `/system/notices/setup/${sessionId}/notice-type`
}

function _returns(returns, selectedReturns = []) {
  return returns.map((returnItem) => {
    return {
      checked: selectedReturns.includes(returnItem.returnId),
      hint: {
        text: `${formatLongDate(new Date(returnItem.startDate))} to ${formatLongDate(new Date(returnItem.endDate))}`
      },
      text: `${returnItem.returnReference} ${returnItem.siteDescription}`,
      value: returnItem.returnId
    }
  })
}

module.exports = {
  go
}
