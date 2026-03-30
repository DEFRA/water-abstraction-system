'use strict'

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/contact-name` page
 *
 * @module SubmitContactNameService
 */

const ContactNamePresenter = require('../../../presenters/billing-accounts/setup/contact-name.presenter.js')
const ContactNameValidator = require('../../../validators/billing-accounts/setup/contact-name.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/contact-name` page
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
  if (session.addressSelected === 'new') {
    return `/system/address/${session.id}/postcode`
  }

  return `/system/billing-accounts/setup/${session.id}/check`
}

async function _save(session, payload) {
  if (session.checkPageVisited && session.contactName !== payload.contactName) {
    session.addressJourney = null
    session.checkPageVisited = false
  }

  if (!session.addressJourney && session.addressSelected === 'new') {
    session.addressJourney = {
      address: {},
      backLink: { href: `/system/billing-accounts/setup/${session.id}/contact-name`, text: 'Back' },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
    }
  }

  session.contactName = payload.contactName

  return session.$update()
}

function _submissionData(session, payload) {
  session.contactName = payload.contactName ?? null

  return ContactNamePresenter.go(session)
}

function _validate(payload) {
  const validationResult = ContactNameValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
