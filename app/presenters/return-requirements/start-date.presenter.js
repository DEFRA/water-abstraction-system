'use strict'

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatedPresenter
 */

function go (session, error = null) {
  const data = {
    id: session.id,
    errorMessage: _error(error),
    licenceRef: session.data.licence.licenceRef,
    licenceStartDate: _startDate(session.data.licence.startDate),
    licenceStartDateValue: session.data.licence.startDate,
    licenceEndDateValue: _endDate(session.data.licence),
    dateFields: _dateFields(error)
  }
  return data
}

function _error (error) {
  if (!error) {
    return null
  }
  const errorMessage = {
    text: error.details[0].message
  }

  return errorMessage
}

function _dateFields (error) {
  const dateFields = [
    {
      classes: _getErrorClass(error, 'day'),
      name: 'day',
      value: ''
    },
    {
      classes: _getErrorClass(error, 'month'),

      name: 'month',
      value: ''
    },
    {
      classes: _getErrorClass(error, 'year'),
      name: 'year',
      value: ''
    }
  ]

  return dateFields
}

function _startDate (date) {
  // convert string from JSONB back to JS Date format so we can format it correctly using formatLongDate utility
  const dateObj = new Date(date)
  const formattedDate = formatLongDate(dateObj)
  return formattedDate
}

function _endDate (licence) {
  const { expiredDate, lapsedDate, revokedDate } = licence
  let endDate = null

  const dates = [expiredDate, lapsedDate, revokedDate].filter(Boolean).map(date => new Date(date))

  // If there are no valid dates, return null
  if (dates.length === 0) {
    return endDate
  }

  // Sort dates and return the earliest, if the value is null, the array will be empty
  endDate = dates.sort((a, b) => a - b)[0].toISOString()
  return endDate
}

function _getErrorClass (error, fieldName) {
  let classes = 'govuk-input--width-2'
  if (!error) {
    classes = 'govuk-input--width-2'
  } else {
    if (error.details[0].invalidFields.includes(fieldName)) {
      classes = 'govuk-input--width-2 govuk-input--error'
    }
  }

  return classes
}

module.exports = {
  go
}
