/**
 * Orchestrates removing multiple licence monitoring stations from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-filtered-thresholds/{absPeriodFilter}` page
 *
 * @module ProcessRemoveFilteredThresholdsService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { flashNotification } from 'water-abstraction-engine/lib/general.lib.js'

import DetermineRelevantLicenceMonitoringStationsService from '../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js'

/**
 * Orchestrates removing multiple licence monitoring stations from the thresholds list for - `/notices/setup/{sessionId}/abstraction-alerts/remove-filtered-thresholds/{absPeriodFilter}` page
 *
 * @param {string} absPeriodFilter
 * @param {string} sessionId
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 */
export default async function processRemoveFilteredThresholdsService(absPeriodFilter, sessionId, yar) {
  const session = await FetchSessionDal(sessionId)

  const relevantLicenceMonitoringStations = _relevantLicenceMonitoringStations(session)

  const licenceMonitoringStationIdsToRemove = _licenceMonitoringStationIdsToRemove(
    absPeriodFilter,
    relevantLicenceMonitoringStations
  )

  await _save(session, licenceMonitoringStationIdsToRemove)

  flashNotification(yar, 'Updated', _notificationMessage(licenceMonitoringStationIdsToRemove))
}

function _licenceMonitoringStationIdsToRemove(absPeriodFilter, licenceMonitoringStations) {
  const matchingLicenceMonitoringStations = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    const periodValue = _periodValue(licenceMonitoringStation)

    return absPeriodFilter === periodValue
  })

  return matchingLicenceMonitoringStations.map((licenceMonitoringStation) => {
    return licenceMonitoringStation.id
  })
}

function _notificationMessage(licenceMonitoringStationIdsToRemove) {
  const numberOfAlerts =
    licenceMonitoringStationIdsToRemove.length === 1
      ? '1 alert'
      : `${licenceMonitoringStationIdsToRemove.length} alerts`

  return `${numberOfAlerts} removed from the send list.`
}

function _periodValue(licenceMonitoringStation) {
  const { abstractionPeriodStartDay, abstractionPeriodStartMonth, abstractionPeriodEndDay, abstractionPeriodEndMonth } =
    licenceMonitoringStation

  return `${abstractionPeriodStartDay}-${abstractionPeriodStartMonth}-${abstractionPeriodEndDay}-${abstractionPeriodEndMonth}`
}

function _relevantLicenceMonitoringStations(session) {
  const { alertThresholds, alertType, licenceMonitoringStations, removedThresholds } = session

  return DetermineRelevantLicenceMonitoringStationsService(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )
}

async function _save(session, licenceMonitoringStationIdsToRemove) {
  if (session.removedThresholds) {
    session.removedThresholds = [...session.removedThresholds, ...licenceMonitoringStationIdsToRemove]
  } else {
    session.removedThresholds = licenceMonitoringStationIdsToRemove
  }

  return session.$update()
}
