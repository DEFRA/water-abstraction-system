'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatedPresenter
 */

function go (session, error = null) {
  const data = {
    id: session.id,
    errorMessage: _error(error),
    licenceRef: session.data.licence.licenceRef,
    licenceStartDate: _formattedStartDate(session.data.licence.startDate),
    licenceStartDateValue: session.data.licence.startDate,
    dateFields: _dateFields(session, error)
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

function _dateFields (_session, error = null) {
  const dateFields = [
    {
      classes: error ? 'govuk-input--width-2 govuk-input--error' : 'govuk-input--width-2',
      name: 'day',
      value: ''
    },
    {
      classes: error ? 'govuk-input--width-2 govuk-input--error' : 'govuk-input--width-2',

      name: 'month',
      value: ''
    },
    {
      classes: error ? 'govuk-input--width-4 govuk-input--error' : 'govuk-input--width-4',
      name: 'year',
      value: ''
    }
  ]

  return dateFields
}

function _formattedStartDate (dateTimeStamp) {
  const date = new Date(dateTimeStamp)

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  // Return the formatted string
  return `${day} ${month} ${year}`
}

module.exports = {
  go
}
