'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/start-date` page
 * @module StartDateService
 */

const GeneralLib = require('../../lib/general.lib.js')
const SessionModel = require('../../models/session.model.js')
const StartDatePresenter = require('../../presenters/return-requirements/start-date.presenter.js')
const StartDateValidator = require('../../validators/return-requirements/start-date.validator.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/start-date` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress. The session has details
 * about the licence that are needed to validate that the chosen date is valid.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} If no errors 2 flags that determine whether the user is returned to the check page or the
 * next page in the journey else the page data for the start date page including the validation error details
 */
async function go (sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const { endDate, startDate } = session.licence
  const validationResult = _validate(payload, startDate, endDate)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar)
    }

    return {
      checkPageVisited: session.checkPageVisited,
      journey: session.journey
    }
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select the start date for the requirements for returns',
    ...submittedSessionData
  }
}

async function _save (session, payload) {
  const selectedOption = payload['start-date-options']

  session.startDateOptions = selectedOption

  if (selectedOption === 'anotherStartDate') {
    session.startDateDay = payload['start-date-day']
    session.startDateMonth = payload['start-date-month']
    session.startDateYear = payload['start-date-year']
  }

  return session.$update()
}

function _submittedSessionData (session, payload) {
  session.startDateDay = payload['start-date-day'] ? payload['start-date-day'] : null
  session.startDateMonth = payload['start-date-month'] ? payload['start-date-month'] : null
  session.startDateYear = payload['start-date-year'] ? payload['start-date-year'] : null
  session.startDateOptions = payload['start-date-options'] ? payload['start-date-options'] : null

  return StartDatePresenter.go(session, payload)
}

function _validate (payload, licenceStartDate, licenceEndDate) {
  const validation = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

  if (!validation.error) {
    return null
  }

  const { message, type } = validation.error.details[0]

  return {
    message,
    radioFormElement: type === 'any.required' ? { text: message } : null,
    dateInputFormElement: type === 'any.required' ? null : { text: message }
  }
}

module.exports = {
  go
}
