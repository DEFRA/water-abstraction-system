'use strict'

/**
 * Orchestrates fetching and presenting the data for `/notices/setup/{sessionId}/licence` page
 * @module LicenceService
 */

const LicencePresenter = require('../../../presenters/notices/setup/licence.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/notices/setup/{sessionId}/licence` page
 *
 * Supports generating the data needed for the licence page for the returns notice journeys. It fetches
 * the current session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the licence page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = LicencePresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}

module.exports = {
  go
}
