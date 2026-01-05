'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/signed-out` page
 *
 * @module ViewSignedOutService
 */

const SignedOutPresenter = require('../../presenters/authentication/signed-out.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `/signed-out` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = SignedOutPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
