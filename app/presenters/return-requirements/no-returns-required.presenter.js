'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredPresenter
 */

function go (session) {
  const data = {
    selectedOption: session.data.reason,
    id: session.id,
    licenceRef: session.data.licence.licenceRef
  }

  return data
}

module.exports = {
  go
}
