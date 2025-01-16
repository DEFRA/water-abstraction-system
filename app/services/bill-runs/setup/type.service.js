'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/type` page
 * @module TypeService
 */

const SessionModel = require('../../../models/session.model.js')
const TypePresenter = require('../../../presenters/bill-runs/setup/type.presenter.js')

const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/type` page
 *
 * Supports generating the data needed for the type page in the setup bill run journey. It fetches the current
 * session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the type page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = TypePresenter.go(session)

  return {
    activeNavBar: 'bill-runs',
    enableTwoPartTariffSupplementary: FeatureFlagsConfig.enableTwoPartTariffSupplementary,
    ...pageData
  }
}

module.exports = {
  go
}
