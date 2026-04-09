'use strict'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/postcode` page
 *
 * @module PostcodeService
 */

const FetchSessionDal = require('../../dal/fetch-session.dal.js')
const PostcodePresenter = require('../../presenters/address/postcode.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/postcode` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = PostcodePresenter.go(session)

  return {
    activeNavBar: session.addressJourney.activeNavBar,
    ...pageData
  }
}

module.exports = {
  go
}
