'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/start-date` page
 * @module StartDateService
 */

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
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the start date page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const { endDate, startDate } = session.data.licence
  const validationResult = _validate(payload, startDate, endDate)
  console.log('🚀🚀🚀 ~ start date options', session.data.startDateOptions)

  if (!validationResult) {
    await _save(session, payload)

    return {
      checkYourAnswersVisited: session.data.checkYourAnswersVisited,
      journey: session.data.journey
    }
  }

  const submittedSessionData = _submittedSessionData(session, payload)
  console.log(' 🚀🚀🚀', session.data.startDateDay, session.data.startDateMonth, session.data.startDateYear, session.data.startDateOptions)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.data.checkYourAnswersVisited,
    error: validationResult,
    journey: session.data.journey,
    pageTitle: 'Select the start date for the return requirement',
    ...submittedSessionData
  }
}

async function _save (session, payload) {
  const currentData = session.data
  const selectedOption = payload['start-date-options']

  currentData.startDateOptions = selectedOption

  if (selectedOption === 'anotherStartDate') {
    currentData.startDateDay = payload['start-date-day']
    currentData.startDateMonth = payload['start-date-month']
    currentData.startDateYear = payload['start-date-year']
  }

  return session.$query().patch({ data: currentData })
}

function _submittedSessionData (session, payload) {
  session.data.startDateDay = payload['start-date-day'] ? payload['start-date-day'] : null
  session.data.startDateMonth = payload['start-date-month'] ? payload['start-date-month'] : null
  session.data.startDateYear = payload['start-date-year'] ? payload['start-date-year'] : null
  session.data.startDateOptions = payload['start-date-options'] ? payload['start-date-options'] : null

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
