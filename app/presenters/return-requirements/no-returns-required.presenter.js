'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredPresenter
 */

const { reasonNewRequirementsFields } = require('../../lib/static-lookups.lib.js')

function go (session, error = null) {
  const data = {
    id: session.id,
    errorMessage: _error(error),
    licenceRef: session.data.licence.licenceRef,
    radioItems: _radioItems(session)
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

function _radioItems (_session) {
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
