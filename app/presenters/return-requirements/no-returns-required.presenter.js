'use strict'

const { reasonNewRequirementsFields } = require('../../lib/static-lookups.lib.js')

function go (session, error = null) {
  const data = {
    activeNavBar: 'search',
    errorMessage: _error(session, error),
    radioItems: _radioButtons(session)
  }

  return data
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

function _error (session, error) {
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
