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
    dateFields: _dateFields(session, error)
  }
  console.log('LICENCE:', session.data.licence)
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

function _startDate (date) {
  // convert string from JSONB back to JS Date format so we can format it correctly using formatLongDate utility
  const dateObj = new Date(date)
  const formattedDate = formatLongDate(dateObj)
  return formattedDate
}

function _endDate (licence) {
  // we need to return the earliest date, so we need to filter out null dates and convert to Date objects.
  const { expiredDate, lapsedDate, revokedDate } = licence
  let endDate = null

  // Filter out null dates and convert to Date objects
  const dates = [expiredDate, lapsedDate, revokedDate].filter(Boolean).map(date => new Date(date))

  // If there are no valid dates, return null
  if (dates.length === 0) {
    return endDate
  }

  // Sort dates and return the earliest, if the value is null, the array will be empty
  endDate = dates.sort((a, b) => a - b)[0].toISOString()
  return endDate
}

module.exports = {
  go
}
