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
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = station

  return `${startDay}-${startMonth}-${endDay}-${endMonth}`
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

  // Note: we deliberately don't fold anything the abstraction period filter excludes into `removedThresholds` here.
  // That's reserved for the explicit, permanent "Remove" action - if we merged filtered-out stations into it too,
  // going back to this page later would only ever show the reduced list of periods rather than the full original one
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
