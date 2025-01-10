'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/reported` page
 * @module SubmitReportedService
 */

const ReportedValidator = require('../../../validators/return-logs/setup/reported.validator.js')
const ReportedPresenter = require('../../../presenters/return-logs/setup/reported.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/reported` page
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
 * @returns {Promise<object>} If no errors the page data for the reported page else the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = ReportedPresenter.go(session)

  return {
    pageTitle: 'How was this return reported?',
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.reported = payload.reported

  return session.$update()
}

function _validate(payload) {
  const validation = ReportedValidator.go(payload)

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
