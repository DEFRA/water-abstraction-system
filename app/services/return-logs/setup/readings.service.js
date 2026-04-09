'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/readings/{yearMonth}`
 * page
 * @module ReadingsService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const ReadingsPresenter = require('../../../presenters/return-logs/setup/readings.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/readings/{yearMonth}`
 * page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {Promise<object>} The view data for the readings page
 */
async function go(sessionId, yearMonth) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = ReadingsPresenter.go(session, yearMonth)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
