'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/account` page
 *
 * @module ViewAccountService
 */

const AccountPresenter = require('../../../presenters/billing-accounts/setup/account.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/account` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = AccountPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
