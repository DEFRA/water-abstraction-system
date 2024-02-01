'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/reason` page
 * @module SelectReasonPresenter
 */

function go (session, error = null) {
  const data = {
    id: session.id,
    errorMessage: _error(error),
    licenceRef: session.data.licence.licenceRef
  }

  return data
}

function _error (error) {
  if (!error) {
    return null
  }

  const errorMessage = {
    text: error.message
  }

  return errorMessage
}

module.exports = {
  go
}
