/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/reported` page
 * @module SubmitReportedService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'
import ReportedPresenter from '../../../presenters/return-logs/setup/reported.presenter.js'
import ReportedValidator from '../../../validators/return-logs/setup/reported.validator.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

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
export default async function submitReported(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const error = _validate(payload)

  if (!error) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      flashNotification(yar, 'Updated', 'Reporting details changed')
    }

    return {
      checkPageVisited: session.checkPageVisited,
      reported: session.reported
    }
  }

  const pageData = ReportedPresenter(session)

  return {
    error,
    ...pageData
  }
}

async function _save(session, payload) {
  session.reported = payload.reported

  return session.$update()
}

function _validate(payload) {
  const validationResult = ReportedValidator(payload)

  return formatValidationResult(validationResult)
}
