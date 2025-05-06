'use strict'

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alert/check-licence-matches` page
 *
 * @module CheckLicenceMatchesService
 */

const CheckLicenceMatchesPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/abstraction-alert/check-licence-matches` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = CheckLicenceMatchesPresenter.go(session)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
