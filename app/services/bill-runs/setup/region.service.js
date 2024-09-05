'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/region` page
 * @module RegionService
 */

const FetchRegionsService = require('./fetch-regions.service.js')
const RegionPresenter = require('../../../presenters/bill-runs/setup/region.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/region` page
 *
 * Supports generating the data needed for the region page in the setup bill run journey. It fetches the current
 * session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the region page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const regions = await FetchRegionsService.go()

  const formattedData = RegionPresenter.go(session, regions)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
