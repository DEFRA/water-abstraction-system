'use strict'

/**
 * Formats data for the `/return-logs/setup/{sessionId}/note` page
 * @module NotePresenter
 */

/**
 * Formats data for the `/return-logs/setup/{sessionId}/note` page
 *
 * @param {module:SessionModel} session - The returns log session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, note, returnReference } = session

  return {
    backLink: { href: `/system/return-logs/setup/${sessionId}/check`, text: 'Back' },
    caption: `Return reference ${returnReference}`,
    note: note ? note.content : null,
    pageTitle: 'Add a note',
    sessionId
  }
}

module.exports = {
  go
}
