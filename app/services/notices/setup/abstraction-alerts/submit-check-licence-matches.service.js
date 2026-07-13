/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module SubmitCheckLicenceMatchesService
 */

import DetermineRelevantLicenceMonitoringStationsService from './determine-relevant-licence-monitoring-stations.service.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId
 *
 */
export default async function (sessionId) {
  const session = await FetchSessionDal(sessionId)

  await _save(session)
}

async function _save(session) {
  const { alertThresholds, licenceMonitoringStations, removedThresholds, alertType } = session

  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsService(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )

  const relevantLicenceRefs = relevantLicenceMonitoringStations.map((station) => {
    return station.licence.licenceRef
  })

  session.licenceRefs = Array.from(new Set(relevantLicenceRefs))
  session.relevantLicenceMonitoringStations = relevantLicenceMonitoringStations

  return session.$update()
}
