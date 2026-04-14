'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 *
 * @module ViewCancelAlertsService
 */

const CancelAlertsPresenter = require('../../../presenters/notices/setup/cancel-alerts.presenter.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = CancelAlertsPresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

module.exports = {
  go
}
