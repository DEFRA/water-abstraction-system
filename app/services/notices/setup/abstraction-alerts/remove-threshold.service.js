'use strict'

/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @module RemoveThresholdService
 */

const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @param {string} sessionId
 * @param {string} licenceMonitoringStationId
 *
 */
async function go(sessionId, licenceMonitoringStationId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session, licenceMonitoringStationId)
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
