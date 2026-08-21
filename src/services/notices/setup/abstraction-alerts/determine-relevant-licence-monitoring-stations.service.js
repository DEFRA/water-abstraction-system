/**
 * Determines relevant licence monitoring stations for the `abstraction-alerts` journey
 *
 * @module DetermineRelevantLicenceMonitoringStationsService
 */

import DetermineRelevantLicenceMonitoringStationsByAlertTypeService from './determine-relevant-licence-monitoring-stations-by-alert-type.service.js'

/**
 * Determines relevant licence monitoring stations for the `abstraction-alerts` journey
 *
 * When building the `abstraction-alerts` journey there is a starting array of 'licenceMonitoringStations'. The user
 * must select at least one 'licenceMonitoringStation' in order to progress the journey. So the
 * 'selectedLicenceMonitoringStations' will always have a length > 0.
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
export default function determineRelevantLicenceMonitoringStationsService(
  licenceMonitoringStations,
  selectedLicenceMonitoringStations,
  removedLicenceMonitoringStations,
  alertType
) {
  const relevantLicenceMonitoringStationsByAlertType = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
    alertType,
    licenceMonitoringStations,
    removedLicenceMonitoringStations
  )

  const relevantLicenceMonitoringStations = relevantLicenceMonitoringStationsByAlertType.filter(
    (licenceMonitoringStation) => {
      return selectedLicenceMonitoringStations.includes(licenceMonitoringStation.thresholdGroup)
    }
  )

  return relevantLicenceMonitoringStations
}
