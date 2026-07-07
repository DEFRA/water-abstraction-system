/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/reason` page
 * @module SubmitReasonService
 */

import { formatValidationResult } from '../../../presenters/base.presenter.js'

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'
import ReasonPresenter from '../../../presenters/return-versions/setup/reason.presenter.js'
import ReasonValidator from '../../../validators/return-versions/setup/reason.validator.js'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/reason` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the reason page including the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      flashNotification(yar, 'Updated', 'Return version updated')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = ReasonPresenter.go(session, payload)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.reason = payload.reason

  return session.$update()
}

function _validate(payload) {
  const validation = ReasonValidator.go(payload)

  return formatValidationResult(validation)
}

export { go }
export default {
  go
}
