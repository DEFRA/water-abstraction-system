'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/check` page
 * @module CheckService
 */

const CheckPresenter = require('../../../presenters/bill-runs/setup/check.presenter.js')
const DetermineBlockingBillRunService = require('./determine-blocking-bill-run.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the check page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const blockingResults = await DetermineBlockingBillRunService.go(session)
  const formattedData = await CheckPresenter.go(session, blockingResults)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

module.exports = {
  go
}
