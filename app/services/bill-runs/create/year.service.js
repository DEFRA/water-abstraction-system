'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/{sessionId}/year` page
 * @module BillRunsCreateYearService
 */

const YearPresenter = require('../../../presenters/bill-runs/create/year.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/create/{sessionId}/year` page
 *
 * Supports generating the data needed for the year page in the create bill run journey. It fetches the current
 * session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} id - The UUID for create bill run session record
 *
 * @returns {Promise<Object>} The view data for the year page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = YearPresenter.go(session)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
