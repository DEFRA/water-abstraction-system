'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/add-note` page
 * @module AddNotePresenter
 */

function go (session) {
  const { id, data } = session

  const pageData = {
    id,
    licenceRef: session.data.licence.licenceRef,
    note: data.note.content || ''
  }

  return pageData
}

module.exports = {
  go
}
