'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { id: sessionId } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/notice-type`,
    continueButton: _continueButton(sessionId),
    pageTitle: 'Check the notice type'
  }
}

function _continueButton(sessionId) {
  return { text: 'Continue to check recipients', href: `/system/notices/setup/${sessionId}/check` }
}

module.exports = {
  go
}
