'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/select-account` page
 *
 * @module ViewSelectAccountService
 */

const ViewSelectAccountPresenter = require('../../../presenters/billing-accounts/setup/view-select-account.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/select-account` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ViewSelectAccountPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
