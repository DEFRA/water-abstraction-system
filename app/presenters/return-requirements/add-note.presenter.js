'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/add-note` page
 * @module AddNotePresenter
 */

function go (session) {
  const data = {
    id: session.id,
    licenceRef: session.data.licence.licenceRef
  }

  return data
}

module.exports = {
  go
}
