'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const NoReturnsRequiredPresenter = require('../../../presenters/return-versions/setup/no-returns-required.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/no-returns-required` page
 *
 * Supports generating the data needed for the no returns required page in the return requirements setup journey. It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<object>} The view data for the no returns required page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = NoReturnsRequiredPresenter.go(session)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
