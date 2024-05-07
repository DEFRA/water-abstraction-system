'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/note` page
 * @module NotePresenter
 */

/**
 * Formats data for the `/return-requirements/{sessionId}/note` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Object} The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence, note } = session

  return {
    backLink: `/system/return-requirements/${sessionId}/check-your-answers`,
    licenceRef: licence.licenceRef,
    note: note ? note.content : '',
    sessionId
  }
}

module.exports = {
  go
}
