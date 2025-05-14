'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alert/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @module RemoveThresholdService
 */

const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alert/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  return {}
}

module.exports = {
  go
}
