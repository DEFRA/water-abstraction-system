'use strict'

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatedPresenter
 */

function go (session, error = null, payload = {}) {
  const data = {
    anotherStartDateHasErrors: !!error,
    dateFields: _dateFields(error, payload),
    errorMessage: _error(error),
    id: session.id,
    licenceId: session.data.licence.id,
    licenceEndDateValue: session.data.licence.endDate,
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
      value: _getFieldValue(payload, 'start-date-day')
    },
    {
      classes: _getErrorClass(error, 'month'),
      name: 'month',
      value: _getFieldValue(payload, 'start-date-month')
    },
    {
      classes: _getErrorClass(error, 'year'),
      name: 'year',
      value: _getFieldValue(payload, 'start-date-year')
    }
  ]

  return dateFields
}

function _getFieldValue (payload, fieldName) {
  let value = null
  if (payload) {
    value = payload[fieldName]
  }

  return value
}

function _startDate (date) {
  // convert string from JSONB back to JS Date format so we can format it correctly using formatLongDate utility
  const dateObj = new Date(date)
  const formattedDate = formatLongDate(dateObj)

  return formattedDate
}

function _getErrorClass (error, fieldName) {
  const baseClass = 'govuk-input--width-2'
  let errorClass = ''

  if (error) {
    const errorDetails = error.details[0]

    const isFieldInvalid = errorDetails?.invalidFields?.includes(fieldName)
    const isDateInvalid = errorDetails?.type === 'date.greater' || errorDetails?.type === 'date.less'

    if (isFieldInvalid || isDateInvalid) {
      errorClass = ' govuk-input--error'
    }
  }

  return baseClass + errorClass
}

module.exports = {
  go
}
