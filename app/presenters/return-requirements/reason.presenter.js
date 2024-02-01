'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/reason` page
 * @module SelectReasonPresenter
 */

const { selectReasonFields } = require('../../lib/static-lookups.lib.js')

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
      value: selectReasonFields[0],
      text: 'Change to special agreement',
      checked: false
    },
    {
      value: selectReasonFields[1],
      text: 'Licence holder name or address change',
      checked: false
    },
    {
      value: selectReasonFields[2],
      text: 'Licence transferred and now chargeable',
      checked: false
    },
    {
      value: selectReasonFields[3],
      text: 'Limited extension of licence validity (LEV)',
      checked: false
    },
    {
      value: selectReasonFields[4],
      text: 'Major change',
      checked: false
    },
    {
      value: selectReasonFields[5],
      text: 'Minor change',
      checked: false
    },
    {
      value: selectReasonFields[6],
      text: 'New licence in part succession or licence apportionment',
      checked: false
    },
    {
      value: selectReasonFields[7],
      text: 'New licence',
      checked: false
    },
    {
      value: selectReasonFields[8],
      text: 'New special agreement',
      checked: false
    },
    {
      value: selectReasonFields[9],
      text: 'Succession or transfer of licence',
      checked: false
    },
    {
      value: selectReasonFields[10],
      text: 'Succession to remainder licence or licence apportionment',
      checked: false
    }
  ]

  return radioItems
}

module.exports = {
  go
}
