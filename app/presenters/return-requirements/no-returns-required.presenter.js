'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredPresenter
 */

function go (session) {
  const data = {
    selectedOption: session.reason || null,
    id: session.id,
    licenceRef: session.licence.licenceRef
  }

  return data
}

module.exports = {
  go
}
