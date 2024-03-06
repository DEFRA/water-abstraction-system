'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/{sessionId}/season` page
 * @module BillRunsCreateSeasonService
 */

const SessionModel = require('../../../models/session.model.js')
const SeasonPresenter = require('../../../presenters/bill-runs/create/season.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/create/{sessionId}/season` page
 *
 * Supports generating the data needed for the type page in the create bill run journey. It fetches the current session
 * record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} id - The UUID for create bill run session record
 *
 * @returns {Promise<Object>} The view data for the season page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = SeasonPresenter.go(session)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
