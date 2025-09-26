'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/reported` page
 * @module SubmitReportedService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const GeneralLib = require('../../../lib/general.lib.js')
const ReportedPresenter = require('../../../presenters/return-logs/setup/reported.presenter.js')
const ReportedValidator = require('../../../validators/return-logs/setup/reported.validator.js')
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
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors the page data for the reported page else the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Reporting details changed')
    }

    return {
      checkPageVisited: session.checkPageVisited,
      reported: session.reported
    }
  }

  const pageData = ReportedPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.reported = payload.reported

  return session.$update()
}

function _validate(payload) {
  const validationResult = ReportedValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
