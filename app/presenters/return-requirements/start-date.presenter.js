'use strict'

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatedPresenter
 */

function go (session, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licenceStartDate: _startDate(session.data.licence.startDate),
    ..._transformPayload(payload)
  }

  return data
}

function _transformPayload (payload) {
  if (!payload) {
    return {
      anotherStartDateDay: null,
      anotherStartDateMonth: null,
      anotherStartDateYear: null,
      anotherStartDateSelected: false,
      licenceStartDateSelected: false
    }
  }

  const selectedOption = payload['start-date-options']

  return {
    anotherStartDateDay: payload['start-date-day'],
    anotherStartDateMonth: payload['start-date-month'],
    anotherStartDateYear: payload['start-date-year'],
    anotherStartDateSelected: selectedOption === 'anotherStartDate',
    licenceStartDateSelected: selectedOption === 'licenceStartDate'
  }
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
