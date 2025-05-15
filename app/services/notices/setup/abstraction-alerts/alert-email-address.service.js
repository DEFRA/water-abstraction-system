'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alert/alert-email-address` page
 *
 * @module AlertEmailAddressService
 */

const AlertEmailAddressPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-email-address.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alert/alert-email-address` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = AlertEmailAddressPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
