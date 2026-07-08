/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/returns-cycle` page
 * @module SubmitReturnsCycleService
 */

import { formatValidationResult } from '../../../presenters/base.presenter.js'

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'
import ReturnsCyclePresenter from '../../../presenters/return-versions/setup/returns-cycle.presenter.js'
import ReturnsCycleValidator from '../../../validators/return-versions/setup/returns-cycle.validator.js'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/returns-cycle` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the returns cycle page including the validation error details
 */
export default async function go(sessionId, requirementIndex, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload, session)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      flashNotification(yar, 'Updated', 'Requirements for returns updated')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = ReturnsCyclePresenter.go(session, requirementIndex)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, requirementIndex, payload) {
  session.requirements[requirementIndex].returnsCycle = payload.returnsCycle

  return session.$update()
}

function _validate(payload, session) {
  const validation = ReturnsCycleValidator.go(payload, session)

  return formatValidationResult(validation)
}
