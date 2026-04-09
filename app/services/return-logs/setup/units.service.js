'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/units` page
 * @module UnitsService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const UnitsPresenter = require('../../../presenters/return-logs/setup/units.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/units` page
 *
 * Supports generating the data needed for the units page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the units page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = UnitsPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
