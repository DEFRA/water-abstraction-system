/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @module ViewCheckService
 */

import CheckPresenter from '../../../presenters/billing-accounts/setup/check.presenter.js'
import FetchCompanyContactsService from './fetch-company-contacts.service.js'
import FetchCompanyService from './fetch-company.service.js'
import FetchExistingAddress from '../../../dal/billing-accounts/fetch-existing-address.dal.js'
import FetchImpactedLicences from '../../../dal/billing-accounts/fetch-impacted-licences.dal.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { markCheckPageVisited } from '../../../lib/check-page.lib.js'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)
  const companyContacts = await _fetchCompanyContacts(session)
  const companysHouseResult = await FetchCompanyService(session.companiesHouseNumber)
  const existingAddress = await _fetchExistingAddress(session)
  const impactedLicences = await FetchImpactedLicences(session.billingAccount.id)

  await markCheckPageVisited(session)
  await _updateAddressJourneyBackLink(session)

  const pageData = CheckPresenter(session, companyContacts, existingAddress, companysHouseResult, impactedLicences)

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

async function _fetchExistingAddress(session) {
  const existingAddress = !!session.addressSelected && session.addressSelected !== 'new'

  if (!existingAddress) {
    return []
  }

  return FetchExistingAddress(session.addressSelected)
}

async function _updateAddressJourneyBackLink(session) {
  if (session.addressJourney) {
    session.addressJourney.backLink = `/system/billing-accounts/setup/${session.id}/check`

    await session.$update()
  }
}
