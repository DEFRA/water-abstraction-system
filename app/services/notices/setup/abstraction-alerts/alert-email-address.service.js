'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @module AlertEmailAddressService
 */

const AlertEmailAddressPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-email-address.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @param {string} sessionId - The UUID for the current session
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = AlertEmailAddressPresenter.go(session, auth)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
