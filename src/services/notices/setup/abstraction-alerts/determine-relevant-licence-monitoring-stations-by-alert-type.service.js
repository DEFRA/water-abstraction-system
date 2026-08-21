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
 * A user can also remove individual 'licenceMonitoringStations' (alerts) for a licence.
 *
 * @param {string} alertType - The type of alert selected by the user. Possible types are "Warning", "Reduce",
 * "Stop", and "Resume".
 * @param {object[]} licenceMonitoringStations - An array of licence monitoring stations
 * @param {string[]} [removedLicenceMonitoringStations] - An array of licence monitoring station IDs to remove
 *
 * @returns {object[]} - The filtered list of licence monitoring stations
 */
export default function determineRelevantLicenceMonitoringStationsByAlertTypeService(
  alertType,
  licenceMonitoringStations,
  removedLicenceMonitoringStations = []
) {
  const remainingLicenceMonitoringStations = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return !removedLicenceMonitoringStations.includes(licenceMonitoringStation.id)
  })

  if (alertType === 'stop') {
    return _stop(remainingLicenceMonitoringStations, alertType)
  }

  if (alertType === 'reduce') {
    return _reduce(remainingLicenceMonitoringStations, alertType)
  }

  return remainingLicenceMonitoringStations
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
