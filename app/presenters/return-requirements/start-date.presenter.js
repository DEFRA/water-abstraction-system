'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatePresenter
*/

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Object} The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence } = session

  return {
    backLink: _backLink(session),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    licenceVersionStartDate: _licenceVersionStartDate(licence.currentVersionStartDate),
    sessionId,
    ..._transformSession(session)
  }
}

function _backLink (session) {
  const { checkYourAnswersVisited, id, licence } = session

  if (checkYourAnswersVisited) {
    return `/system/return-requirements/${id}/check-your-answers`
  }

  return `/licences/${licence.id}#charge`
}

function _licenceVersionStartDate (date) {
  // NOTE: because the session data is stored in a JSONB field when we get the instance from the DB the date values are
  // in JS Date format (string). So, we have to convert it to a date before calling `formatLongDate()`
  const dateObj = new Date(date)
  const formattedDate = formatLongDate(dateObj)

  return formattedDate
}

function _transformSession (session) {
  // NOTE: 'startDateOptions' is the session value that tells us whether the user selected the licence version start
  // date or another date radio button.
  //
  // If it is not set then either it's because the presenter has been called from `StartDateService` and it's the first
  // load. Else its been called by `SubmitStartDateService` but the user hasn't selected a radio button.
  //
  // Either way, we use it to tell us whether there is anything in the session worth transforming.
  const selectedOption = session.startDateOptions

  if (!selectedOption) {
    return {
      anotherStartDateDay: null,
      anotherStartDateMonth: null,
      anotherStartDateYear: null,
      selectedOption: null
    }
  }

  return {
    anotherStartDateDay: session.startDateDay,
    anotherStartDateMonth: session.startDateMonth,
    anotherStartDateYear: session.startDateYear,
    selectedOption
  }
}

module.exports = {
  go
}
