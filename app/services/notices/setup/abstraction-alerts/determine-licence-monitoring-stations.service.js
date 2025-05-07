'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 * @module DetermineLicenceMonitoringStationsService
 */

const FetchLicenceMonitoringStationsService = require('./fetch-monitoring-station.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {Promise<{object}>}
 */
async function go(id) {
  const monitoringStation = await FetchLicenceMonitoringStationsService.go(id)

  return {
    licenceMonitoringStations: _licenceMonitoringStations(monitoringStation.licenceMonitoringStations),
    monitoringStationId: id,
    monitoringStationName: monitoringStation.label
  }
}

function _licenceMonitoringStations(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const {
      licence: { licenceRef },
      licenceVersionPurposeCondition,
      ...rest
    } = licenceMonitoringStation

    return {
      licenceRef,
      ...rest,
      ..._licenceVersionPurpose(licenceVersionPurposeCondition),
      thresholdGroup: _thresholdGroup(rest.measureType, rest.thresholdValue, rest.thresholdUnit)
    }
  })
}

function _licenceVersionPurpose(licenceVersionPurposeCondition) {
  if (licenceVersionPurposeCondition?.licenceVersionPurpose) {
    return licenceVersionPurposeCondition.licenceVersionPurpose
  } else {
    return {}
  }
}

function _thresholdGroup(measureType, thresholdValue, thresholdUnit) {
  return `${measureType}-${thresholdValue}-${thresholdUnit}`
}

module.exports = {
  go
}
