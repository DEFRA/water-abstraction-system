'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-address` page
 *
 * @module ExistingAddressService
 */

const FetchCompanyAddressesService = require('./fetch-company-addresses.service.js')
const ExistingAddressPresenter = require('../../../presenters/billing-accounts/setup/existing-address.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-address` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const companyId = session.accountSelected === 'another' ? session.existingAccount : session.accountSelected
  const companyAddresses = await FetchCompanyAddressesService.go(companyId)

  const pageData = ExistingAddressPresenter.go(session, companyAddresses)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
