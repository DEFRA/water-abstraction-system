/**
 * Orchestrates validating the data for '/notices/setup/{sessionId}/select-recipients' page
 *
 * @module SubmitSelectRecipientsService
 */

import FetchRecipientsService from './fetch-recipients.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'
import SelectRecipientsPresenter from '../../../presenters/notices/setup/select-recipients.presenter.js'
import SelectRecipientsValidator from '../../../validators/notices/setup/select-recipients.validator.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { handleOneOptionSelected } from '../../../lib/submit-page.lib.js'

/**
 * Orchestrates validating the data for '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function (sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  handleOneOptionSelected(payload, 'recipients')

  const error = _validate(payload)

  if (!error) {
    await _save(session, payload)

    flashNotification(yar, 'Updated', 'The recipients have been changed. Check details before sending invitations.')

    return {}
  }

  const selectedRecipients = payload.recipients || []

  _clearSelectedRecipients(session)

  const recipients = await FetchRecipientsService(session)

  const pageData = SelectRecipientsPresenter(session, recipients, selectedRecipients)

  return {
    error,
    ...pageData
  }
}

async function _save(session, payload) {
  session.selectedRecipients = payload.recipients

  return session.$update()
}

/**
 * Clear the 'selectedRecipients' from the session to fetch all the recipients
 *
 * @private
 */
function _clearSelectedRecipients(session) {
  delete session.selectedRecipients
}

function _validate(payload) {
  const validationResult = SelectRecipientsValidator(payload)

  return formatValidationResult(validationResult)
}
