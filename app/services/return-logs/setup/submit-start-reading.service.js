'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/start-reading` page
 * @module SubmitStartReadingService
 */

const SessionModel = require('../../../models/session.model.js')
const StartReadingPresenter = require('../../../presenters/return-logs/setup/start-reading.presenter.js')
const StartReadingValidator = require('../../../validators/return-logs/setup/start-reading.validator.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/start-reading` page
 *
 * It first retrieves the session instance for the return log setup session in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors the page data for the start reading page else the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  session.startReading = payload.startReading
  const formattedData = StartReadingPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.startReading = payload.startReading

  return session.$update()
}

function _validate(payload) {
  const validation = StartReadingValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
