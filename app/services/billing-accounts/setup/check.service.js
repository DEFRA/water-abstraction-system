'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @module CheckService
 */

const CheckPresenter = require('../../../presenters/billing-accounts/setup/check.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = CheckPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
