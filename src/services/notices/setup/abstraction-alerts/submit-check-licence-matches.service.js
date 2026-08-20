/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module SubmitCheckLicenceMatchesService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { clearFilters } from 'water-abstraction-engine/lib/submit-page.lib.js'

import DetermineRelevantLicenceMonitoringStationsService from './determine-relevant-licence-monitoring-stations.service.js'

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {string} sessionId
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - An object with `checkLicenceMatches` indicating whether to stay on the page
 */
export default async function submitCheckLicenceMatchesService(payload, sessionId, yar) {
  const filterCleared = clearFilters(payload, yar, 'absPeriodFilter')

  if (filterCleared) {
    return { checkLicenceMatches: true }
  }

  if (payload.applyFilters) {
    yar.set('absPeriodFilter', {
      absPeriod: payload.absPeriod ?? null
    })

    return { checkLicenceMatches: true }
  }

  const session = await FetchSessionDal(sessionId)

  await _save(session)

  return { checkLicenceMatches: false }
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
