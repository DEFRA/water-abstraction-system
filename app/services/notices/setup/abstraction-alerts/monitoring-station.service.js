'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 * @module MonitoringStationService
 */

const FetchMonitoringStationService = require('./fetch-monitoring-station.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {Promise<{object}>}
 */
async function go(id) {
  const licenceMonitoringStations = await FetchMonitoringStationService.go(id)

  const monitoringStationName = licenceMonitoringStations[0].label

  return {
    monitoringStationName,
    licenceMonitoringStations: _licenceMonitoringStations(licenceMonitoringStations)
  }
}

function _licenceMonitoringStations(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    delete licenceMonitoringStation.label

    return licenceMonitoringStation
  })
}

module.exports = {
  go
}
