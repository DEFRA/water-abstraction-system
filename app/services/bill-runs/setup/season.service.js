'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/season` page
 * @module BillRunsCreateSeasonService
 */

const SessionModel = require('../../../models/session.model.js')
const SeasonPresenter = require('../../../presenters/bill-runs/setup/season.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/season` page
 *
 * Supports generating the data needed for the type page in the create bill run journey. It fetches the current
 * session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the season page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  return SeasonPresenter.go(session)
}

module.exports = {
  go
}
