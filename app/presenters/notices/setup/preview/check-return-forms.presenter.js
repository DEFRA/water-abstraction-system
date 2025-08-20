'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-return-forms` page
 * @module CheckReturnFormsPresenter
 */

const { formatLongDate } = require('../../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-return-forms` page
 * @param {module:SessionModel} session - The session instance
 * @param {string} contactHashId - The recipients unique identifier
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, contactHashId) {
  const { dueReturns, referenceCode, selectedReturns, id: sessionId } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/check`,
    caption: `Notice ${referenceCode}`,
    pageTitle: 'Check the recipient previews',
    returnLogs: _returnLogs(dueReturns, selectedReturns, sessionId, contactHashId)
  }
}

function _returnLogs(dueReturns, selectedReturns, sessionId, contactHashId) {
  const returnLogs = dueReturns.filter((dueReturn) => {
    return selectedReturns.includes(dueReturn.returnId)
  })

  return returnLogs.map((dueReturn) => {
    return {
      returnReference: dueReturn.returnReference,
      siteDescription: dueReturn.siteDescription,
      returnPeriod: `${formatLongDate(new Date(dueReturn.startDate))} to ${formatLongDate(new Date(dueReturn.endDate))}`,
      action: {
        link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/return-forms/${dueReturn.returnId}`,
        text: 'Preview'
      }
    }
  })
}

module.exports = {
  go
}
