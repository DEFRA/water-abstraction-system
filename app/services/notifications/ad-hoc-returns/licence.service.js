'use strict'

/**
 * Orchestrates fetching and presenting the data for `/notifications/ad-hoc-returns/{sessionId}/licence` page
 * @module LicenceService
 */

const LicencePresenter = require('../../../presenters/notifications/ad-hoc-returns/licence.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/notifications/ad-hoc-returns/{sessionId}/licence` page
 *
 * Supports generating the data needed for the licence page in the ad-hoc returns notification journey. It fetches
 * the current session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {Promise<object>} The view data for the licence page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = LicencePresenter.go(session.licenceRef)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

module.exports = {
  go
}
