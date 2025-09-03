'use strict'

/**
 * Formats data for the '/notices/setup/{sessionId}/recipient-name' page
 * @module RecipientNamePresenter
 */

/**
 * Formats data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @param {SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, contactName: name } = session

  return {
    backLink: { text: 'Back', href: `/system/notices/setup/${sessionId}/check` },
    name,
    pageTitle: "Enter the recipient's name"
  }
}

module.exports = {
  go
}
