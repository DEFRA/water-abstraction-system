'use strict'

/**
 * Orchestrates validating the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @module SubmitRecipientNameService
 */

const RecipientNamePresenter = require('../../../presenters/notices/setup/recipient-name.presenter.js')
const RecipientNameValidator = require('../../../validators/notices/setup/recipient-name.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  session.contactName = payload.name

  const pageData = RecipientNamePresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

/**
 * We save the back link so the generic address journey can redirect back to this page
 *
 * @private
 */
async function _save(session, payload) {
  session.contactName = payload.name

  session.backLink = {
    href: `/system/notices/setup/${session.id}/recipient-name`,
    text: 'Back'
  }

  return session.$update()
}

function _validate(payload) {
  const validation = RecipientNameValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message,
    href: '#name'
  }
}

module.exports = {
  go
}
