'use strict'

/**
 * Orchestrates fetching and presenting the data for `/notices/setup/{sessionId}/ad-hoc-licence` page
 * @module AdHocLicenceService
 */

const AdHocLicencePresenter = require('../../../presenters/notices/setup/ad-hoc-licence.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/notices/setup/{sessionId}/ad-hoc-licence` page
 *
 * Supports generating the data needed for the licence page in the ad-hoc returns notice journey. It fetches
 * the current session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notice session record
 *
 * @returns {Promise<object>} The view data for the licence page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = AdHocLicencePresenter.go(session.licenceRef, session.referenceCode)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

module.exports = {
  go
}
