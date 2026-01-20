'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/for-attention-of` page
 *
 * @module SubmitForAttentionOfService
 */

const ForAttentionOfPresenter = require('../../../presenters/billing-accounts/setup/for-attention-of.presenter.js')
const ForAttentionOfValidator = require('../../../validators/billing-accounts/setup/for-attention-of.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return payload
  }

  const pageData = ForAttentionOfPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.forAttentionOf = payload.forAttentionOf

  return session.$update()
}

function _validate(payload) {
  const validationResult = ForAttentionOfValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
