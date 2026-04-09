'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @module ViewAccountTypeService
 */

const AccountTypePresenter = require('../../../presenters/billing-accounts/setup/account-type.presenter.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = AccountTypePresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
