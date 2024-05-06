'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/note` page
 * @module NotePresenter
 */

function go (session) {
  const { id, note } = session

  const data = {
    id,
    licenceRef: session.licence.licenceRef,
    note: note ? note.content : ''
  }

  return data
}

module.exports = {
  go
}
