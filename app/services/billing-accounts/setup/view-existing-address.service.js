'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-address` page
 *
 * @module ExistingAddressService
 */

const ExistingAddressPresenter = require('../../../presenters/billing-accounts/setup/existing-address.presenter.js')
const FetchCompanyAddressesService = require('./fetch-company-addresses.service.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-address` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)
  const companyAddresses = await _fetchCompanyAddresses(session)

  const pageData = ExistingAddressPresenter.go(session, companyAddresses)

  return {
    ...pageData
  }
}

async function _fetchCompanyAddresses(session) {
  const newAccount = !!session.existingAccount && session.existingAccount !== 'new'
  const companyId = newAccount ? session.existingAccount : session.billingAccount.company.id

  const companyAddresses = await FetchCompanyAddressesService.go(companyId)

  return companyAddresses
}

module.exports = {
  go
}
