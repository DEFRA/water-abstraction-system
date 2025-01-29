'use strict'

/**
 * Formats data for the `/return-logs/setup/{sessionId}/note` page
 * @module NotePresenter
 */

/**
 * Formats data for the `/return-logs/setup/{sessionId}/note` page
 *
 * @param {module:SessionModel} session - The returns submission session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, note, returnReference } = session

  return {
    backLink: `/system/return-logs/setup/${sessionId}/check`,
    note: note ? note.content : null,
    pageTitle: 'Add a note',
    returnReference,
    sessionId
  }
}

module.exports = {
  go
}
