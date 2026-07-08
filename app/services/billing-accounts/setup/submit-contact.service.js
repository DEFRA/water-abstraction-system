/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module SubmitContactService
 */

import ContactPresenter from '../../../presenters/billing-accounts/setup/contact.presenter.js'
import ContactValidator from '../../../validators/billing-accounts/setup/contact.validator.js'
import FetchCompanyContactsService from './fetch-company-contacts.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

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

  const companyContacts = await FetchCompanyContactsService(companyId)

  return ContactPresenter(session, companyContacts)
}

function _validate(payload) {
  const validationResult = ContactValidator.go(payload)

  return formatValidationResult(validationResult)
}
