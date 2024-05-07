'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/setup` page
 * @module SetupPresenter
 */

function go (session) {
  const data = {
    id: session.id,
    licenceRef: session.licence.licenceRef,
    setup: session.setup ? session.setup : null
  }

  return data
}

module.exports = {
  go
}
