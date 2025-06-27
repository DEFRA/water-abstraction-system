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
 * @param {object[]}returns
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, returns) {
  return {
    pageTitle: 'Select the returns for the paper forms',
    returns: _returns(returns, session.selectedReturns)
  }
}

// selected rows need to be unque? like threshold - use date ? - otherwise it slected all return ref
function _returns(returns, selectedReturns = []) {
  return returns.map((returnItem) => {
    return {
      checked: selectedReturns.includes(returnItem.returnReference),
      hint: {
        text: `${formatLongDate(returnItem.startDate)} to ${formatLongDate(returnItem.endDate)}`
      },
      text: `${returnItem.returnReference} ${returnItem.description}`,
      value: returnItem.returnReference
    }
  })
}

module.exports = {
  go
}
