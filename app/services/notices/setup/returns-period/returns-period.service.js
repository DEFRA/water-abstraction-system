'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup returns period page
 * @module ReturnsPeriodService
 */

const ReturnsPeriodPresenter = require('../../../../presenters/notices/setup/returns-period/returns-period.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the notices setup returns period page
 *
 * @param {string} sessionId - The UUID for setup returns notification session record
 *
 * @returns {object} The view data for the returns period page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ReturnsPeriodPresenter.go(session)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
