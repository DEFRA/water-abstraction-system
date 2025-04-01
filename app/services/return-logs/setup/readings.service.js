'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module ReadingsService
 */

const ReadingsPresenter = require('../../../presenters/return-logs/setup/readings.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {Promise<object>} an object representing the data needed for the readings template
 */
async function go(sessionId, yearMonth) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = ReadingsPresenter.go(session, yearMonth)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
