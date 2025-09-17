'use strict'

/**
 * Orchestrates validating the data for '/notices/setup/{sessionId}/select-recipients' page
 *
 * @module SubmitSelectRecipientsService
 */

const FetchRecipientsService = require('./fetch-recipients.service.js')
const GeneralLib = require('../../../lib/general.lib.js')
const SelectRecipientsPresenter = require('../../../presenters/notices/setup/select-recipients.presenter.js')
const SelectRecipientsValidator = require('../../../validators/notices/setup/select-recipients.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    GeneralLib.flashNotification(
      yar,
      'Updated',
      'The recipients have been changed. Check details before sending invitations.'
    )

    return {}
  }

  const selectedRecipients = payload.recipients || []

  _clearSelectedRecipients(session)

  const recipients = await FetchRecipientsService.go(session)

  const pageData = SelectRecipientsPresenter.go(session, recipients, selectedRecipients)

  return {
    error: validationResult,
    ...pageData
  }
}

function _handleOneOptionSelected(payload) {
  if (payload.recipients && !Array.isArray(payload?.recipients)) {
    payload.recipients = [payload?.recipients]
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
  const validationResult = SelectRecipientsValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
