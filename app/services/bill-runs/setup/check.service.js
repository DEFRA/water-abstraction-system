'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/check` page
 * @module CheckService
 */

const AllowedBillRunPresenter = require('../../../presenters/bill-runs/setup/check/allowed-bill-run.presenter.js')
const BlockedBillRunPresenter = require('../../../../app/presenters/bill-runs/setup/check/blocked-bill-run.presenter.js')
const DetermineBlockingBillRunService = require('./determine-blocking-bill-run.service.js')
const NoAnnualBillRunPresenter = require('../../../presenters/bill-runs/setup/check/no-annual-bill-run.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

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

  const formattedData = _formattedData(session, blockingResults)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

function _formattedData(session, blockingResults) {
  if (blockingResults.toFinancialYearEnding === 0) {
    return NoAnnualBillRunPresenter.go(session)
  }

  if (blockingResults.trigger === engineTriggers.neither) {
    return BlockedBillRunPresenter.go(session, blockingResults)
  }

  return AllowedBillRunPresenter.go(session, blockingResults)
}

module.exports = {
  go
}
