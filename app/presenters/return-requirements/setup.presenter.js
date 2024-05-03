'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/setup` page
 * @module SetupPresenter
 */

function go (session) {
  const data = {
    id: session.id,
    licenceRef: session.data.licence.licenceRef,
    setup: session.data.setup ? session.data.setup : null
  }

  return data
}

module.exports = {
  go
}
