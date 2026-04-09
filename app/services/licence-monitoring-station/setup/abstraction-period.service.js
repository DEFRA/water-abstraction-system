'use strict'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @module AbstractionPeriodService
 */

const AbstractionPeriodPresenter = require('../../../presenters/licence-monitoring-station/setup/abstraction-period.presenter.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = AbstractionPeriodPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
