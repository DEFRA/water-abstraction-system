'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/{sessionId}/type` page
 * @module BillRunsCreateTypeService
 */

const SessionModel = require('../../../models/session.model.js')
const TypePresenter = require('../../../presenters/bill-runs/create/type.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/create/{sessionId}/type` page
 *
 * Supports generating the data needed for the type page in the create bill run journey. It fetches the current session
 * record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} id - The UUID for create bill run session record
 *
 * @returns {Promise<Object>} The view data for the type page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = TypePresenter.go(session)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
