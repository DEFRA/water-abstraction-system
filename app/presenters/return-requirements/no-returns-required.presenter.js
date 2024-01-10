'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredPresenter
 */

const { reasonNewRequirementsFields } = require('../../lib/static-lookups.lib.js')

function go (session, error = null) {
  const data = {
    id: session.id,
    activeNavBar: 'search',
    errorMessage: _error(session, error),
    licenceRef: session.data.licence.licenceRef,
    radioItems: _radioButtons(session)
  }

  return data
}

function _error (session, error) {
  if (!error) {
    return null
  }

  const errorMessage = {
    text: error.message
  }

  return errorMessage
}

function _radioButtons (session) {
  const radioItems = [
    {
      value: reasonNewRequirementsFields[0],
      text: 'Abstraction amount below 100 cubic metres per day',
      checked: false
    },
    {
      value: reasonNewRequirementsFields[1],
      text: 'Returns exception',
      checked: false
    },
    {
      value: reasonNewRequirementsFields[2],
      text: 'Transfer licence',
      checked: false
    }
  ]

  return radioItems
}

module.exports = {
  go
}
