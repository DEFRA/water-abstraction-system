'use strict'

/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @module ProcessRemoveThresholdService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const GeneralLib = require('../../../lib/general.lib.js')
const { formatRestrictionType, formatValueUnit } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @param {string} sessionId
 * @param {string} licenceMonitoringStationId
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 */
async function go(sessionId, licenceMonitoringStationId, yar) {
  const session = await FetchSessionDal.go(sessionId)

  await _save(session, licenceMonitoringStationId)

  GeneralLib.flashNotification(yar, 'Updated', _notificationMessage(session, licenceMonitoringStationId))
}

function _notificationMessage(session, licenceMonitoringStationId) {
  const licenceMonitoringStation = session.licenceMonitoringStations.find((station) => {
    return station.id === licenceMonitoringStationId
  })

  return `Removed ${licenceMonitoringStation.licence.licenceRef} ${formatRestrictionType(licenceMonitoringStation.restrictionType)} ${formatValueUnit(licenceMonitoringStation.thresholdValue, licenceMonitoringStation.thresholdUnit)}`
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
