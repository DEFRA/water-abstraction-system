'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 * @module MonitoringStationService
 */

const MonitoringStationModel = require('../../../../../app/models/monitoring-station.model.js')

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {object} - the monitoring station data
 */
async function go(id) {
  const data = await _fetchMonitoringStationModel(id)

  return data
}

async function _fetchMonitoringStationModel(id) {
  return MonitoringStationModel.query().select(['label']).findById(id)
}

module.exports = {
  go
}
