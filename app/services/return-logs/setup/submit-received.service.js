'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/received` page
 * @module SubmitReceivedService
 */

const ReceivedDateValidator = require('../../../validators/return-logs/setup/received-date.validator.js')
const ReceivedPresenter = require('../../../presenters/return-logs/setup/received.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/received` page
 *
 * It first retrieves the session instance for the return log setup session in progress. The session has details about
 * the return log that are needed to validate that the chosen date is valid.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors the page data for the received page else the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const { startDate } = session
  const validationResult = _validate(payload, startDate)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = _submittedSessionData(session, payload)

  return {
    pageTitle: 'When was the return received?',
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  const selectedOption = payload['received-date-options']
  session.receivedDateOptions = selectedOption
  const todaysDate = new Date(new Date().setHours(0, 0, 0, 0))

  if (selectedOption === 'today') {
    session.receivedDate = todaysDate
  } else if (selectedOption === 'yesterday') {
    // The setDate method updates the date object in place and returns a timestamp,
    // not the updated date object itself. To ensure we store the correct date,
    // we first modify the 'yesterday' variable and then assign it to session.receivedDate.
    todaysDate.setDate(todaysDate.getDate() - 1)
    session.receivedDate = todaysDate
  } else {
    session.receivedDateDay = payload['received-date-day']
    session.receivedDateMonth = payload['received-date-month']
    session.receivedDateYear = payload['received-date-year']
    session.receivedDate = new Date(
      `${payload['received-date-year']}-${payload['received-date-month']}-${payload['received-date-day']}`
    )
  }

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.receivedDateDay = payload['received-date-day'] ?? null
  session.receivedDateMonth = payload['received-date-month'] ?? null
  session.receivedDateYear = payload['received-date-year'] ?? null
  session.receivedDateOptions = payload['received-date-options'] ?? null

  const data = ReceivedPresenter.go(session)
  return data
}

function _validate(payload, startDate) {
  const validation = ReceivedDateValidator.go(payload, startDate)

  if (!validation.error) {
    return null
  }

  const { message, type } = validation.error.details[0]

  // There are only two possible error scenarios: either a radio button has not been selected, in which case the date
  // isn't visible so there cannot be an "invalid date" error; or an invalid date has been entered, in which case the
  // date *is* visible so there cannot be a "radio button not selected" error. We identify the former by checking if the
  // error type is `any.required`; and so if an error is present which isn't of this type, it must be a date error.
  return {
    message,
    radioFormElement: type === 'any.required' ? { text: message } : null,
    dateInputFormElement: type === 'any.required' ? null : { text: message }
  }
}

module.exports = {
  go
}
