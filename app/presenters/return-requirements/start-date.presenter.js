'use strict'

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatedPresenter
 */

function go (session, error = null, payload = {}) {
  const data = {
    anotherStartDateHasErrors: !!error,
    errorMessage: _error(error),
    id: session.id,
    licenceId: session.data.licence.id,
    licenceEndDateValue: session.data.licence.endDate,
    licenceRef: session.data.licence.licenceRef,
    licenceStartDate: _startDate(session.data.licence.startDate),
    licenceStartDateValue: session.data.licence.startDate,
    ..._transformPayload(payload)
  }

  return data
}

function _transformPayload (payload) {
  if (!payload) {
    return {
      anotherStartDateDay: null,
      anotherStartDateMonth: null,
      anotherStartDateYear: null
    }
  }

  return {
    anotherStartDateDay: payload['start-date-day'],
    anotherStartDateMonth: payload['start-date-month'],
    anotherStartDateYear: payload['start-date-year']
  }
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

function _startDate (date) {
  // convert string from JSONB back to JS Date format so we can format it correctly using formatLongDate utility
  const dateObj = new Date(date)
  const formattedDate = formatLongDate(dateObj)

  return formattedDate
}

module.exports = {
  go
}
