'use strict'

/**
 * Orchestrates validating the data for '/notices/setup/{sessionId}/select-recipients' page
 *
 * @module SubmitSelectRecipientsService
 */

const RecipientsService = require('./recipients.service.js')
const SelectRecipientsPresenter = require('../../../presenters/notices/setup/select-recipients.presenter.js')
const SelectRecipientsValidator = require('../../../validators/notices/setup/select-recipients.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  session.selectedRecipients = payload.recipients || []

  const recipients = await RecipientsService.go(session, true)

  const pageData = SelectRecipientsPresenter.go(session, recipients)

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

function _validate(payload) {
  const validation = SelectRecipientsValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
