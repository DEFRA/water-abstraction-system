'use strict'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @module AlertThresholdsService
 */

const AlertThresholdsPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = AlertThresholdsPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
