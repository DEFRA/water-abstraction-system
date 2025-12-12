'use strict'

/**
 * Orchestrates fetching and presenting the data for the `` page
 *
 * @module SelectAccountService
 */

const SelectAccountPresenter = require('../../../presenters/billing-accounts/setup/select-account.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = SelectAccountPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
