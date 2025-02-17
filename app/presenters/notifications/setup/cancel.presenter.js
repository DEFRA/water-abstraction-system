'use strict'

/**
 * Formats data for the `/notifications/setup/{sessionId}/cancel` page
 * @module CancelPresenter
 */

/**
 * Formats data for the `/notifications/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 *
 * @param session
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { referenceCode } = session

  return {
    pageTitle: 'You are about to cancel this notification',
    referenceCode,
    summaryList: _summaryList(session)
  }
}

function _summaryList(session) {
  if (session.journey === 'ad-hoc') {
    return {
      text: 'Licence number',
      value: session.licenceRef
    }
  }

  return {
    text: 'Returns period',
    value: 'wip'
  }
}

module.exports = {
  go
}
