/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module SubmitCheckLicenceMatchesService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import DetermineRelevantLicenceMonitoringStationsService from './determine-relevant-licence-monitoring-stations.service.js'

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
export default async function submitCheckLicenceMatchesService(sessionId, yar) {
  const session = await FetchSessionDal(sessionId)

  await _save(session, yar)
}

function _periodValue(station) {
  return `${station.abstractionPeriodStartDay}-${station.abstractionPeriodStartMonth}-${station.abstractionPeriodEndDay}-${station.abstractionPeriodEndMonth}`
}

async function _save(session, yar) {
  const { alertThresholds, licenceMonitoringStations, removedThresholds, alertType } = session

  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsService(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )

  const savedFilter = yar.get(`checkLicenceMatchesFilter-${session.id}`)
  const selectedPeriods = savedFilter?.periods ?? []

  // Anything filtered out by the selected abstraction periods is treated the same as a manually removed threshold,
  // so the rest of the journey (for example the preview pages) stays consistent with what was filtered here
  if (selectedPeriods.length > 0) {
    const filteredOutIds = relevantLicenceMonitoringStations
      .filter((station) => {
        return !selectedPeriods.includes(_periodValue(station))
      })
      .map((station) => {
        return station.id
      })

    session.removedThresholds = Array.from(new Set([...(removedThresholds ?? []), ...filteredOutIds]))
  }

  const finalRelevantLicenceMonitoringStations = relevantLicenceMonitoringStations.filter((station) => {
    return selectedPeriods.length === 0 || selectedPeriods.includes(_periodValue(station))
  })

  const relevantLicenceRefs = finalRelevantLicenceMonitoringStations.map((station) => {
    return station.licence.licenceRef
  })

  session.licenceRefs = Array.from(new Set(relevantLicenceRefs))
  session.relevantLicenceMonitoringStations = finalRelevantLicenceMonitoringStations

  return session.$update()
}
