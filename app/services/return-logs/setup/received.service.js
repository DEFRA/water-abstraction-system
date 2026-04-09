'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/received` page
 * @module ReceivedService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const ReceivedPresenter = require('../../../presenters/return-logs/setup/received.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/received` page
 *
 * Supports generating the data needed for the received page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the received page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = ReceivedPresenter.go(session)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
