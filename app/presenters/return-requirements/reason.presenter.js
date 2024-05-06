'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/reason` page
 * @module SelectReasonPresenter
 */

function go (session) {
  const data = {
    id: session.id,
    licenceRef: session.licence.licenceRef,
    reason: session.reason ? session.reason : null
  }

  return data
}

module.exports = {
  go
}
