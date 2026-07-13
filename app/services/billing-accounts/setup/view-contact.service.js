/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module ViewContactService
 */

import ContactPresenter from '../../../presenters/billing-accounts/setup/contact.presenter.js'
import FetchCompanyContactsService from './fetch-company-contacts.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewContact(sessionId) {
  const session = await FetchSessionDal(sessionId)
  const companyContacts = await _fetchCompanyContacts(session)

  const pageData = ContactPresenter(session, companyContacts)

  return {
    ...pageData
  }
}

async function _fetchCompanyContacts(session) {
  const newAccount = !!session.existingAccount && session.existingAccount !== 'new'
  const companyId = newAccount ? session.existingAccount : session.billingAccount.company.id

  const companyContacts = await FetchCompanyContactsService(companyId)

  return companyContacts
}
