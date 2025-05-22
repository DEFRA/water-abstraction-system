'use strict'

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module SubmitCheckLicenceMatchesService
 */

const DetermineRelevantLicenceMonitoringStationsService = require('./determine-relevant-licence-monitoring-stations.service.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId
 *
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session)
}

async function _save(session) {
  const { alertThresholds, licenceMonitoringStations, removedThresholds } = session

  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsService.go(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds
  )

  const relevantLicenceRefs = relevantLicenceMonitoringStations.map((station) => {
    return station.licence.licenceRef
  })

  session.licenceRefs = Array.from(new Set(relevantLicenceRefs))
  session.relevantLicenceMonitoringStations = relevantLicenceMonitoringStations

  return session.$update()
}

module.exports = {
  go
}
