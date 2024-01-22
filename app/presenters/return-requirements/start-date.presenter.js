'use strict'

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatedPresenter
 */

function go (session, error = null, payload) {
  const data = {
    anotherStartDateHasErrors: !!error,
    dateFields: _dateFields(error, payload),
    errorMessage: _error(error),
    id: session.id,
    licenceEndDateValue: _endDate(session.data.licence),
    licenceRef: session.data.licence.licenceRef,
    licenceStartDate: _startDate(session.data.licence.startDate),
    licenceStartDateValue: session.data.licence.startDate
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

function _dateFields (error, payload) {
  const dateFields = [
    {
      classes: _getErrorClass(error, 'day'),
      name: 'day',
      value: _setErrorValue(error, payload, 'day')
    },
    {
      classes: _getErrorClass(error, 'month'),

      name: 'month',
      value: _setErrorValue(error, payload, 'month')
    },
    {
      classes: _getErrorClass(error, 'year'),
      name: 'year',
      value: _setErrorValue(error, payload, 'year')
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

/**
 * Returns the earliest end date value from the licence expiredDate, lapsedDate, or revokedDate properties.
 * Sorts the valid date values and returns the earliest date string in ISO format.
 * If no valid end dates exist, returns null.
*/
function _endDate (licence) {
  const { expiredDate, lapsedDate, revokedDate } = licence
  let endDate = null

  const dates = [expiredDate, lapsedDate, revokedDate]
    .filter(Boolean)
    .map(date => new Date(date))

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

  if (error) {
    if (error.details[0].invalidFields.includes(fieldName)) {
      classes = 'govuk-input--width-2 govuk-input--error'
    }
  }

  return classes
}

function _setErrorValue (error, payload, fieldName) {
  let value = payload[`start-date-${fieldName}`]
  if (error) {
    if (error.details[0].invalidFields.includes(fieldName)) {
      value = null
    }
  }

  return value
}

module.exports = {
  go
}
