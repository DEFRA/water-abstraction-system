'use strict'

/**
 * Initiates the session record used for setting up a new licence monitoring station
 * @module InitiateSessionService
 */

const MonitoringStationModel = require('../../../models/monitoring-station.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Initiates the session record used for setting up a new licence monitoring station journey
 *
 * During the setup for a new licence monitoring station we temporarily store the data in a `SessionModel`
 * instance. It is expected that on each page of the journey the GET will fetch the session record and use it to
 * populate the view.
 * When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to create the new licence monitoring
 * station and the session record itself deleted.
 *
 * @param {string} monitoringStationId - The UUID of the monitoring station to be fetched
 *
 * @returns {Promise<string>} the sessionId used for the redirect
 */
async function go(monitoringStationId) {
  const monitoringStation = await _fetchMonitoringStation(monitoringStationId)
  const data = { monitoringStationId, ...monitoringStation }

  const { id: sessionId } = await SessionModel.query().insert({ data }).returning('id')

  return sessionId
}

async function _fetchMonitoringStation(monitoringStationId) {
  return MonitoringStationModel.query().select('label').findById(monitoringStationId)
}

module.exports = {
  go
}
