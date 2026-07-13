/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @module ProcessRemoveThresholdService
 */

import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../../lib/general.lib.js'
import { formatRestrictionType, formatValueUnit } from '../../../../presenters/base.presenter.js'

/**
 * Orchestrates removing the licence monitoring station from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}` page
 *
 * @param {string} sessionId
 * @param {string} licenceMonitoringStationId
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 */
export default async function (sessionId, licenceMonitoringStationId, yar) {
  const session = await FetchSessionDal(sessionId)

  await _save(session, licenceMonitoringStationId)

  flashNotification(yar, 'Updated', _notificationMessage(session, licenceMonitoringStationId))
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
