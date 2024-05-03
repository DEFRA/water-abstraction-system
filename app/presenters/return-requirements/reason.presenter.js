'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/reason` page
 * @module SelectReasonPresenter
 */

function go (session) {
  const data = {
    id: session.id,
    licenceRef: session.data.licence.licenceRef,
    reason: session.data.reason ? session.data.reason : null
  }

  return data
}

module.exports = {
  go
}
