'use strict'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module FullConditionService
 */

const FetchFullConditionService = require('./fetch-full-condition.service.js')
const FullConditionPresenter = require('../../../presenters/licence-monitoring-station/setup/full-condition.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const conditions = await FetchFullConditionService.go(session.licenceId)

  const pageData = FullConditionPresenter.go(session, conditions)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
