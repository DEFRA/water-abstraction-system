'use strict'

/**
 * Determines the relevant licence monitoring stations for a given alert type in the `abstraction-alerts` journey.
 *
 * @module DetermineRelevantLicenceMonitoringStationsByAlertTypeService
 */

/**
 * Determines the relevant licence monitoring stations for a given alert type in the `abstraction-alerts` journey.
 *
 * Licence monitoring stations have a `restrictionType` property, which can be:
 * - "stop"
 * - "reduce"
 * - "stop_or_reduce"
 *
 * The system supports four alert types:
 * - "Warning" – includes all stations (no restrictions).
 * - "Reduce" – includes stations with `restrictionType` "reduce" or "stop_or_reduce".
 * - "Stop" – includes stations with `restrictionType` "stop".
 * - "Resume" – includes all stations (similar to "Warning").
 *
 * This function ensures the correct set of stations is selected based on alert type.
 *
 * @param {object[]} licenceMonitoringStations - An array of licence monitoring stations
 * @param {string} alertType - The type of alert selected by the user. Possible types are:
 * "Warning", "Reduce", "Stop", and "Resume".
 *
 * @returns {object[]} - The filtered list of licence monitoring stations
 */
function go(licenceMonitoringStations, alertType) {
  if (alertType === 'stop') {
    return _stop(licenceMonitoringStations, alertType)
  }

  if (alertType === 'reduce') {
    return _reduce(licenceMonitoringStations, alertType)
  }

  return licenceMonitoringStations
}

function _reduce(licenceMonitoringStations, alertType) {
  return licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return (
      licenceMonitoringStation.restrictionType === alertType ||
      licenceMonitoringStation.restrictionType === 'stop_or_reduce'
    )
  })
}

function _stop(licenceMonitoringStations, alertType) {
  return licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return licenceMonitoringStation.restrictionType === alertType
  })
}

module.exports = {
  go
}
