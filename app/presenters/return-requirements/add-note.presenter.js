'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/add-note` page
 * @module AddNotePresenter
 */

function go (session) {
  const data = {
    id: session.id,
    licenceRef: session.data.licence.licenceRef,
    ..._transformSession(session.data)
  }

  return data
}

function _transformSession (sessionData) {
  const currentNote = sessionData.note

  if (!currentNote) {
    return {
      note: ''
    }
  }

  return {
    note: decodeURIComponent(sessionData.note)
  }
}

module.exports = {
  go
}
