'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/received` page
 * @module SubmitReceivedService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const ReceivedDateValidator = require('../../../validators/return-logs/setup/received-date.validator.js')
const ReceivedPresenter = require('../../../presenters/return-logs/setup/received.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { flashNotification, today } = require('../../../lib/general.lib.js')

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
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors the page data for the received page else the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const { startDate } = session
  const validationResult = _validate(payload, startDate)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      flashNotification(yar, 'Updated', 'Reporting details changed')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  const selectedOption = payload.receivedDateOptions
  const todaysDate = today()

  session.receivedDateOptions = selectedOption

  if (selectedOption === 'today') {
    session.receivedDate = todaysDate
  } else if (selectedOption === 'yesterday') {
    // The setDate method updates the date object in place and returns a timestamp,
    // not the updated date object itself. To ensure we store the correct date,
    // we first modify the 'yesterday' variable and then assign it to session.receivedDate.
    todaysDate.setDate(todaysDate.getDate() - 1)
    session.receivedDate = todaysDate
  } else {
    session.receivedDateDay = payload.receivedDateDay
    session.receivedDateMonth = payload.receivedDateMonth
    session.receivedDateYear = payload.receivedDateYear
    session.receivedDate = new Date(
      `${payload.receivedDateYear}-${payload.receivedDateMonth}-${payload.receivedDateDay}`
    )
  }

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.receivedDateDay = payload.receivedDateDay ?? null
  session.receivedDateMonth = payload.receivedDateMonth ?? null
  session.receivedDateYear = payload.receivedDateYear ?? null
  session.receivedDateOptions = payload.receivedDateOptions ?? null

  const data = ReceivedPresenter.go(session)
  return data
}

function _validate(payload, startDate) {
  const validation = ReceivedDateValidator.go(payload, startDate)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
