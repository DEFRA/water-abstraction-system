'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 * @module CheckLicenceMatchesPresenter
 */

const { determineRestrictionHeading, formatRestrictions } = require('../../../monitoring-stations/base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { licenceMonitoringStations, alertThresholds, monitoringStationName, id: sessionId } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/abstraction-alerts/alert-thresholds`,
    cancelLink: `/system/notices/setup/${sessionId}/abstraction-alerts/cancel`,
    caption: monitoringStationName,
    pageTitle: 'Check the licence matches for the selected thresholds',
    restrictions: _restrictions(licenceMonitoringStations, alertThresholds, sessionId),
    restrictionHeading: determineRestrictionHeading(licenceMonitoringStations)
  }
}

function _relevantLicenceMonitoringStations(licenceMonitoringStations, alertThresholds) {
  return licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return alertThresholds.includes(licenceMonitoringStation.thresholdGroup)
  })
}

function _restrictions(licenceMonitoringStations, alertThresholds, sessionId) {
  const relevantLicenceMonitoringStations = _relevantLicenceMonitoringStations(
    licenceMonitoringStations,
    alertThresholds
  )

  const preparedLicenceMonitoringStations = relevantLicenceMonitoringStations.map((licenceMonitoringStation) => {
    return {
      ...licenceMonitoringStation,
      action: {
        link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove/${licenceMonitoringStation.id}`,
        text: 'Remove'
      },
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
