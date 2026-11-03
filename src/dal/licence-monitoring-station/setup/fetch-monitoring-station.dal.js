/**
 * Fetches the monitoring station record used for setting up a new licence monitoring station
 * @module FetchMonitoringStationDal
 */

import MonitoringStationModel from 'water-abstraction-engine/models/monitoring-station.model.js'

/**
 * Fetches the monitoring station record used for setting up a new licence monitoring station
 *
 * @param {string} monitoringStationId - The UUID of the monitoring station to be fetched
 *
 * @returns {Promise<object>} The matching instance of the `MonitoringStationModel` populated with the
 * data needed to set up a new licence monitoring station
 */
export default async function fetchMonitoringStationDal(monitoringStationId) {
  return MonitoringStationModel.query().select('label').findById(monitoringStationId)
}
