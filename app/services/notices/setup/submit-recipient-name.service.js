/**
 * Orchestrates validating the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @module SubmitRecipientNameService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import RecipientNamePresenter from '../../../presenters/notices/setup/recipient-name.presenter.js'
import RecipientNameValidator from '../../../validators/notices/setup/recipient-name.validator.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function (sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  session.contactName = payload.name

  const pageData = RecipientNamePresenter(session)

  return {
    error: validationResult,
    activeNavBar: 'notices',
    ...pageData
  }
}

async function _save(session, payload) {
  session.contactName = payload.name

  return session.$update()
}

function _validate(payload) {
  const validationResult = RecipientNameValidator(payload)

  return formatValidationResult(validationResult)
}
