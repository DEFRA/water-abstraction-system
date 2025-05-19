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
  const {
    alertThresholds,
    id: sessionId,
    licenceMonitoringStations,
    monitoringStationName,
    removedThresholds
  } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/abstraction-alerts/alert-thresholds`,
    cancelLink: `/system/notices/setup/${sessionId}/abstraction-alerts/cancel`,
    caption: monitoringStationName,
    pageTitle: 'Check the licence matches for the selected thresholds',
    restrictions: _restrictions(licenceMonitoringStations, alertThresholds, removedThresholds, sessionId),
    restrictionHeading: determineRestrictionHeading(licenceMonitoringStations)
  }
}

function _action(sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove-threshold/${licenceMonitoringStation.id}`,
    text: 'Remove'
  }
}

function _relevantLicenceMonitoringStations(licenceMonitoringStations, alertThresholds, removedThresholds) {
  const relevantLicenceMonitoringStations = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return alertThresholds.includes(licenceMonitoringStation.thresholdGroup)
  })

  if (removedThresholds) {
    return relevantLicenceMonitoringStations.filter((licenceMonitoringStation) => {
      return !removedThresholds.includes(licenceMonitoringStation.id)
    })
  }

  return relevantLicenceMonitoringStations
}

function _restrictions(licenceMonitoringStations, alertThresholds, removedThresholds, sessionId) {
  const relevantLicenceMonitoringStations = _relevantLicenceMonitoringStations(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds
  )

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
