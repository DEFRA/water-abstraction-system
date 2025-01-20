'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/start-date` page
 * @module StartDateService
 */

const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')
const StartDatePresenter = require('../../../presenters/return-versions/setup/start-date.presenter.js')
const StartDateValidator = require('../../../validators/return-versions/setup/start-date.validator.js')
const { isQuarterlyReturnSubmissions } = require('../../../lib/dates.lib.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/start-date` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress. The session has details
 * about the licence that are needed to validate that the chosen date is valid.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors 2 flags that determine whether the user is returned to the check page or the
 * next page in the journey else the page data for the start date page including the validation error details
 */
async function go(sessionId, payload, yar) {
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
    ...submittedSessionData
  }
}

/**
 * Default Quarterly Returns
 *
 * When a return version is for a water company and the start date is for quarterly returns.
 *
 * We need to default the quarterly returns to true.
 *
 * However, we only want to do this on the initial setting of the start date after that it is in the users control.
 *
 * @param {SessionModel} session
 *
 * @private
 */
function _defaultQuarterlyReturns(session) {
  if (
    !session.checkPageVisited &&
    isQuarterlyReturnSubmissions(session.returnVersionStartDate) &&
    session.licence.waterUndertaker
  ) {
    session.quarterlyReturns = true
  }
}

async function _save(session, payload) {
  const selectedOption = payload['start-date-options']

  session.startDateOptions = selectedOption

  if (selectedOption === 'anotherStartDate') {
    session.startDateDay = payload['start-date-day']
    session.startDateMonth = payload['start-date-month']
    session.startDateYear = payload['start-date-year']
    session.returnVersionStartDate = new Date(
      `${payload['start-date-year']}-${payload['start-date-month']}-${payload['start-date-day']}`
    )
  } else {
    session.returnVersionStartDate = new Date(session.licence.currentVersionStartDate)
  }

  _defaultQuarterlyReturns(session)

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.startDateDay = payload['start-date-day'] ? payload['start-date-day'] : null
  session.startDateMonth = payload['start-date-month'] ? payload['start-date-month'] : null
  session.startDateYear = payload['start-date-year'] ? payload['start-date-year'] : null
  session.startDateOptions = payload['start-date-options'] ? payload['start-date-options'] : null

  return StartDatePresenter.go(session, payload)
}

function _validate(payload, licenceStartDate, licenceEndDate) {
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
