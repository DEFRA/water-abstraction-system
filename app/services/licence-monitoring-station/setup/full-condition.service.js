'use strict'

/**
 * Orchestrates fetching and presenting the data for the `` page
 *
 * @module FullConditionService
 */

const FullConditionPresenter = require('../../../presenters/licence-monitoring-station/setup/full-condition.presenter.js')
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

  const pageData = FullConditionPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
