'use strict'

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module SubmitContactService
 */

const ContactPresenter = require('../../../presenters/billing-accounts/setup/contact.presenter.js')
const ContactValidator = require('../../../validators/billing-accounts/setup/contact.validator.js')
const FetchCompanyContactsService = require('./fetch-company-contacts.service.js')
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

  const pageData = await _submissionData(session)

  return {
    error: validationResult,
    ...pageData
  }
}

function _redirectUrl(session) {
  if (!session.checkPageVisited && session.contactSelected === 'new') {
    return `/system/billing-accounts/setup/${session.id}/contact-name`
  }

  if (session.addressSelected === 'new') {
    return `/system/address/${session.id}/postcode`
  }

  return `/system/billing-accounts/setup/${session.id}/check`
}

async function _save(session, payload) {
  if (session.contactSelected && session.contactSelected !== payload.contactSelected) {
    session.addressJourney = null
    session.checkPageVisited = false
    session.contactName = null
  }

  if (!session.addressJourney && session.addressSelected === 'new') {
    session.addressJourney = {
      address: {},
      backLink: { href: `/system/billing-accounts/setup/${session.id}/contact`, text: 'Back' },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
    }
  }

  session.contactSelected = payload.contactSelected

  return session.$update()
}

async function _submissionData(session) {
  const newAccount = !!session.existingAccount && session.existingAccount !== 'new'
  const companyId = newAccount ? session.existingAccount : session.billingAccount.company.id

  const companyContacts = await FetchCompanyContactsService.go(companyId)

  return ContactPresenter.go(session, companyContacts)
}

function _validate(payload) {
  const validationResult = ContactValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
