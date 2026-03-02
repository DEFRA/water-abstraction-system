'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module ViewContactService
 */

const ContactPresenter = require('../../../presenters/billing-accounts/setup/contact.presenter.js')
const FetchCompanyContactsService = require('./fetch-company-contacts.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const companyContacts = await _fetchCompanyContacts(session)

  const pageData = ContactPresenter.go(session, companyContacts)

  return {
    ...pageData
  }
}

async function _fetchCompanyContacts(session) {
  const newAccount = !!session.existingAccount && session.existingAccount !== 'new'
  const companyId = newAccount ? session.existingAccount : session.billingAccount.company.id

  const companyContacts = await FetchCompanyContactsService.go(companyId)

  return companyContacts
}

module.exports = {
  go
}
