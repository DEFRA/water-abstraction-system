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
  return {
    pageTitle: 'Select the returns for the paper forms',
    returns: _returns(session.selectedReturns)
  }
}

function _returns(selectedReturns = []) {
  const mock = [
    {
      returnReference: '1',
      description: 'Potable Water Supply - Direct',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01')
    },
    {
      returnReference: '2',
      description: 'Potable Water Supply - Direct',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01')
    }
  ]

  return mock.map((returnItem) => {
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
