'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 * @module DetermineLicenceMonitoringStationsService
 */

const FetchLicenceMonitoringStationsService = require('./fetch-licence-monitoring-stations.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {Promise<{object}>}
 */
async function go(id) {
  const licenceMonitoringStations = await FetchLicenceMonitoringStationsService.go(id)

  const monitoringStationName = licenceMonitoringStations[0].label

  return {
    licenceMonitoringStations: _licenceMonitoringStations(licenceMonitoringStations),
    monitoringStationId: id,
    monitoringStationName
  }
}

function _licenceMonitoringStations(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation, index) => {
    delete licenceMonitoringStation.label

    return {
      id: `${index}`,
      ...licenceMonitoringStation
    }
  })
}

module.exports = {
  go
}
