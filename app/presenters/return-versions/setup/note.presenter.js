'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/note` page
 * @module NotePresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/note` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, licence, note } = session

  return {
    backLink: {
      href: `/system/return-versions/setup/${sessionId}/check`,
      text: 'Back'
    },
    licenceRef: licence.licenceRef,
    note: note ? note.content : null,
    pageTitle: 'Add a note',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId
  }
}

module.exports = {
  go
}
