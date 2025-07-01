'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/returns-for-paper-forms` page
 * @module ReturnsForPaperFormsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { dueReturns, selectedReturns } = session

  return {
    pageTitle: 'Select the returns for the paper forms',
    returns: _returns(dueReturns, selectedReturns)
  }
}

function _returns(returns, selectedReturns = []) {
  return returns.map((returnItem) => {
    return {
      checked: selectedReturns.includes(returnItem.returnId),
      hint: {
        text: `${formatLongDate(new Date(returnItem.startDate))} to ${formatLongDate(new Date(returnItem.endDate))}`
      },
      text: `${returnItem.returnReference} ${returnItem.description}`,
      value: returnItem.returnId
    }
  })
}

module.exports = {
  go
}
