'use strict'

/**
 * Determines relevant licence monitoring stations for the `abstraction-alerts` journey
 *
 * @module DetermineRelevantLicenceMonitoringStationsService
 */

const DetermineRelevantLicenceMonitoringStationsByAlertTypeService = require('./determine-relevant-licence-monitoring-stations-by-alert-type.service.js')

/**
 * Determines relevant licence monitoring stations for the `abstraction-alerts` journey
 *
 * When building the `abstraction-alerts` journey there is a starting array of 'licenceMonitoringStations'. The user
 * must select at least one 'licenceMonitoringStation' in order to progress the journey. So the
 * 'selectedLicenceMonitoringStations' will always have a length > 0.
 *
 * A user can remove 'licenceMonitoringStations' for a licence. When this happens we need to return the
 * 'licenceMonitoringStations' with those choices removed.
 *
 * We keep the original array intact.
 *
 * @param {object[]} licenceMonitoringStations
 * @param {object[]} selectedLicenceMonitoringStations
 * @param {object[]} removedLicenceMonitoringStations
 * @param {string} alertType
 *
 * @returns {Array<object>}
 */
function go(licenceMonitoringStations, selectedLicenceMonitoringStations, removedLicenceMonitoringStations, alertType) {
  const relevantLicenceMonitoringStationsByAlertType = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
    licenceMonitoringStations,
    alertType
  )

  const relevantLicenceMonitoringStations = relevantLicenceMonitoringStationsByAlertType.filter(
    (licenceMonitoringStation) => {
      return selectedLicenceMonitoringStations.includes(licenceMonitoringStation.thresholdGroup)
    }
  )

  if (removedLicenceMonitoringStations) {
    return relevantLicenceMonitoringStations.filter((licenceMonitoringStation) => {
      return !removedLicenceMonitoringStations.includes(licenceMonitoringStation.id)
    })
  }

  return relevantLicenceMonitoringStations
}

module.exports = {
  go
}
