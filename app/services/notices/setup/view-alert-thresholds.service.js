'use strict'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @module ViewAlertThresholdsService
 */

const AlertThresholdsPresenter = require('../../../presenters/notices/setup/alert-thresholds.presenter.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = AlertThresholdsPresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

module.exports = {
  go
}
