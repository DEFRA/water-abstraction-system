/**
 * Orchestrates validating the data for `address/{sessionId}/postcode` page
 *
 * @module SubmitPostcodeService
 */

import FetchSessionDal from '../../dal/fetch-session.dal.js'
import PostcodePresenter from '../../presenters/address/postcode.presenter.js'
import PostcodeValidator from '../../validators/address/postcode.validator.js'
import { formatValidationResult } from '../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for `address/{sessionId}/postcode` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  _applyPayload(session, payload)

  const error = _validate(payload)

  if (!error) {
    await _save(session)

    return {}
  }

  const pageData = PostcodePresenter.go(session)

  return {
    error,
    ...pageData
  }
}

/**
 * Applies the payload to the session object.
 *
 * We can apply the payload _before_ validating. This is because if it is valid, we can then simply update the session
 * object in `_save()`.
 * If it is not valid, we want to replay what they entered. The presenter will ensure we do that because it takes its
 * data from the session, which we've updated with the payload values!
 *
 * @private
 */
function _applyPayload(session, payload) {
  session.addressJourney.address.postcode = payload.postcode
}

async function _save(session) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = PostcodeValidator.go(payload)

  return formatValidationResult(validationResult)
}
