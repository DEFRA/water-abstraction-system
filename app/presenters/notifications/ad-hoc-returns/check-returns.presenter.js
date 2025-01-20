'use strict'

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 * @module CheckReturnsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 *
 * @param {object} data - The session instance to format
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} - The data formatted for the view template
 */
function go(data, session) {
  return {
    licenceHolder: data.$licenceHolder(),
    sessionId: session.id,
    licenceRef: session.licenceRef,
    returnLogs: _returnLogs(data.returnLogs),
    contacts: _contacts(data),
    backLink: '/system/notifications/ad-hoc-returns/' + session.id + '/licence'
  }
}

function _contacts(data) {
}


function _returnLogs(returnLogs) {
  return returnLogs.map((returnLog) => {
    return `${returnLog.returnReference} Due on ${formatLongDate(new Date(returnLog.dueDate))}`
  })
}

module.exports = {
  go
}
