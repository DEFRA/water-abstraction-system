'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup returns period page
 * @module ReturnsPeriodService
 */

const ReturnsPeriodPresenter = require('../../../presenters/notices/setup/returns-period.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup returns period page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {object} The view data for the returns period page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = ReturnsPeriodPresenter.go(session)

  return {
    activeNavBar: 'manage',
    pageTitle: 'Select the returns periods for the invitations',
    ...formattedData
  }
}

module.exports = {
  go
}
