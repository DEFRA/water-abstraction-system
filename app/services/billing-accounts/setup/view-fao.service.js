'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @module FAOService
 */

const FAOPresenter = require('../../../presenters/billing-accounts/setup/fao.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = FAOPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
