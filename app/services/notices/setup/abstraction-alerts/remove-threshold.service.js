'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @module RemoveThresholdService
 */

const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @param {string} sessionId
 * @param {string} licenceMonitoringStationId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, licenceMonitoringStationId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session, licenceMonitoringStationId)

  return {}
}

async function _save(session, licenceMonitoringStationId) {
  if (session.removedThresholds) {
    session.removedThresholds = [...session.removedThresholds, licenceMonitoringStationId]
  } else {
    session.removedThresholds = [licenceMonitoringStationId]
  }

  return session.$update()
}

module.exports = {
  go
}
