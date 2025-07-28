'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 * @module CheckLicenceMatchesPresenter
 */

const DetermineRelevantLicenceMonitoringStationsService = require('../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js')
const { determineRestrictionHeading, formatRestrictions } = require('../../../monitoring-stations/base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const relevantLicenceMonitoringStations = _relevantLicenceMonitoringStations(session)

  return {
    backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`,
    cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
    caption: session.monitoringStationName,
    pageTitle: 'Check the licence matches for the selected thresholds',
    restrictions: _restrictions(relevantLicenceMonitoringStations, session.id),
    restrictionHeading: determineRestrictionHeading(relevantLicenceMonitoringStations)
  }
}

function _action(sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove-threshold/${licenceMonitoringStation.id}`,
    text: 'Remove'
  }
}

function _relevantLicenceMonitoringStations(session) {
  const { alertThresholds, alertType, licenceMonitoringStations, removedThresholds } = session

  return DetermineRelevantLicenceMonitoringStationsService.go(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )
}

function _restrictions(relevantLicenceMonitoringStations, sessionId) {
  const multipleRestrictions = relevantLicenceMonitoringStations.length > 1

  const preparedLicenceMonitoringStations = relevantLicenceMonitoringStations.map((licenceMonitoringStation) => {
    return {
      ...licenceMonitoringStation,
      action: multipleRestrictions ? _action(sessionId, licenceMonitoringStation) : null,
      statusUpdatedAt: licenceMonitoringStation.statusUpdatedAt
        ? new Date(licenceMonitoringStation.statusUpdatedAt)
        : null
    }
  })

  return formatRestrictions(preparedLicenceMonitoringStations)
}

module.exports = {
  go
}
