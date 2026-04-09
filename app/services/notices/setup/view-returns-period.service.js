'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup returns period page
 * @module ViewReturnsPeriodService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const ReturnsPeriodPresenter = require('../../../presenters/notices/setup/returns-period.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the notices setup returns period page
 *
 * @param {string} sessionId - The UUID for setup returns notification session record
 *
 * @returns {Promise<object>} The view data for the returns period page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = ReturnsPeriodPresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}

module.exports = {
  go
}
