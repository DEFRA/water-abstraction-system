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
    licenceStartDate: formatLongDate(session.data.licence.startDate),
    licenceStartDateValue: session.data.licence.startDate,
    licenceEndDateValue: session.data.licence.endDate,
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

module.exports = {
  go
}
