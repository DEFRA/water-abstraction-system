'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @module SelectExistingAddressService
 */

const FetchExistingAddressesService = require('./fetch-existing-addresses.service.js')
const SelectExistingAddressPresenter = require('../../../presenters/billing-accounts/setup/select-existing-address.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const companyAddresses = await FetchExistingAddressesService.go(session.billingAccount.company.id)

  const pageData = SelectExistingAddressPresenter.go(session, companyAddresses)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
