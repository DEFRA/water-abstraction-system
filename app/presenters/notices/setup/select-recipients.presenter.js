'use strict'

/**
 * Formats data for the '/notices/setup/{sessionId}/select-recipients' page
 * @module SelectRecipientsPresenter
 */

/**
 * Formats data for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param session
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { id: sessionId } = session

  return {
    pageTitle: 'Select Recipients',
    backLink: `/system/notices/setup/${sessionId}/check`
  }
}

module.exports = {
  go
}
