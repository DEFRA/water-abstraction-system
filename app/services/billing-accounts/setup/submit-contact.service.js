'use strict'

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module SubmitContactService
 */

const ContactPresenter = require('../../../presenters/billing-accounts/setup/contact.presenter.js')
const ContactValidator = require('../../../validators/billing-accounts/setup/contact.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: _redirectUrl(session)
    }
  }

  const pageData = _submissionData(session, payload)

  return {
    error: validationResult,
    ...pageData
  }
}

function _redirectUrl(session) {
  if (session.contactSelected === 'person') {
    return `/system/billing-accounts/setup/${session.id}/create-contact`
  }

  return `/system/billing-accounts/setup/${session.id}/check`
}

async function _save(session, payload) {
  session.contactSelected = payload.contactSelected
  session.department = payload.contactSelected === 'department' ? payload.department : null

  return session.$update()
}

function _submissionData(session, payload) {
  session.contactSelected = payload.contactSelected ?? null
  session.department = payload.contactSelected === 'department' ? payload.department : null

  return ContactPresenter.go(session)
}

function _validate(payload) {
  const validationResult = ContactValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
