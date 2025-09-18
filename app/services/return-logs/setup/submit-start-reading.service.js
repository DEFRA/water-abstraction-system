'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/start-reading` page
 * @module SubmitStartReadingService
 */

const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')
const StartReadingPresenter = require('../../../presenters/return-logs/setup/start-reading.presenter.js')
const StartReadingValidator = require('../../../validators/return-logs/setup/start-reading.validator.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

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
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors the page data for the start reading page else the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload, session)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Reporting details changed')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  session.startReading = payload.startReading
  const pageData = StartReadingPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.startReading = Number(payload.startReading)

  return session.$update()
}

function _validate(payload, session) {
  const validationResult = StartReadingValidator.go(payload, session.lines)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
