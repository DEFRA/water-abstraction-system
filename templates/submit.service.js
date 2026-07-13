/**
 * Orchestrates validating the data for the '' page
 *
 * @module __MODULE_NAME__
 */

import __PRESENTER_NAME__ from '__PRESENTER_PATH__'
import __VALIDATOR_NAME__ from '__VALIDATOR_PATH__'
import FetchSessionDal from '__FETCH_SESSION_DAL_PATH__'
import { formatValidationResult } from '__BASE_PRESENTER_PATH__'

/**
 * Orchestrates validating the data for the '' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = __PRESENTER_NAME__(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = __VALIDATOR_NAME__(payload)

  return formatValidationResult(validationResult)
}
