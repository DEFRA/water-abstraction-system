'use strict'

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module ViewCheckLicenceMatchesService
 */

const CheckLicenceMatchesPresenter = require('../../../presenters/notices/setup/check-licence-matches.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { readFlashNotification } = require('../../../lib/general.lib.js')

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = CheckLicenceMatchesPresenter.go(session)

  const notification = readFlashNotification(yar)

  return {
    activeNavBar: 'notices',
    ...pageData,
    notification
  }
}

module.exports = {
  go
}
