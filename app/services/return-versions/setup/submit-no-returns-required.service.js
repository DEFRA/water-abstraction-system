/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/no-returns-required` page
 * @module StartDateService
 */

import { formatValidationResult } from '../../../presenters/base.presenter.js'

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import NoReturnsRequiredPresenter from '../../../presenters/return-versions/setup/no-returns-required.presenter.js'
import NoReturnsRequiredValidator from '../../../validators/return-versions/setup/no-returns-required.validator.js'
import { flashNotification } from '../../../lib/general.lib.js'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/no-returns-required` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The page data for the no returns required page
 */
export default async function submitNoReturnsRequiredService(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      flashNotification(yar, 'Updated', 'Return version updated')
    }

    return {
      checkPageVisited: session.checkPageVisited,
      journey: session.journey
    }
  }

  const formattedData = NoReturnsRequiredPresenter(session, payload)

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
  const validation = NoReturnsRequiredValidator(payload)

  return formatValidationResult(validation)
}
