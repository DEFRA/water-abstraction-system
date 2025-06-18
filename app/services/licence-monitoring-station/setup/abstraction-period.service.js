'use strict'

/**
 * Orchestrates fetching and presenting the data for the `` page
 *
 * @module AbstractionPeriodService
 */

const AbstractionPeriodPresenter = require('../../../presenters/licence-monitoring-station/setup/abstraction-period.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = AbstractionPeriodPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
