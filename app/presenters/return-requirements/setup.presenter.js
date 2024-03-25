'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/setup` page
 * @module SetupPresenter
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
