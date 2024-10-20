'use strict'

/**
 * Formats data for the `/return-requirements/setup/{sessionId}/note` page
 * @module NotePresenter
 */

/**
 * Formats data for the `/return-requirements/setup/{sessionId}/note` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence, note } = session

  return {
    backLink: `/system/return-requirements/${sessionId}/check`,
    licenceRef: licence.licenceRef,
    note: note ? note.content : null,
    sessionId
  }
}

module.exports = {
  go
}
