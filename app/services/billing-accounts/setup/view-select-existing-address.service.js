'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @module SelectExistingAddressService
 */

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

  const pageData = SelectExistingAddressPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
