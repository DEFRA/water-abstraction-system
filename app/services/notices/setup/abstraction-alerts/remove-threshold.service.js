'use strict'

/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @module RemoveThresholdService
 */

const GeneralLib = require('../../../../lib/general.lib.js')
const SessionModel = require('../../../../models/session.model.js')
const { formatRestrictionType } = require('../../../../presenters/monitoring-stations/base.presenter.js')

/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @param {string} sessionId
 * @param {string} licenceMonitoringStationId
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 */
async function go(sessionId, licenceMonitoringStationId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session, licenceMonitoringStationId)

  GeneralLib.flashNotification(yar, 'Updated', _notificationMessage(session, licenceMonitoringStationId))
}

function _notificationMessage(session, licenceMonitoringStationId) {
  const licenceMonitoringStation = session.licenceMonitoringStations.find((licenceMonitoringStation) => {
    return licenceMonitoringStation.id === licenceMonitoringStationId
  })

  return `Removed ${licenceMonitoringStation.licence.licenceRef} ${formatRestrictionType(licenceMonitoringStation.restrictionType)} ${licenceMonitoringStation.thresholdValue}${licenceMonitoringStation.thresholdUnit}`
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
