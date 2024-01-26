'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatedPresenter
*/

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} The data formatted for the view template
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

function _startDate (date) {
  // NOTE: because the session data is stored in a JSONB field when we get the instance from the DB the date values are
  // in JS Date format (string). So, we have to convert it to a date before calling `formatLongDate()`
  const dateObj = new Date(date)
  const formattedDate = formatLongDate(dateObj)

  return formattedDate
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

module.exports = {
  go
}
