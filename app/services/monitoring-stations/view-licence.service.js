'use strict'

/**
 * Orchestrates fetching and presenting the data for `/monitoring-stations/{monitoringStationId}/licence/{licenceId}`
 * @module ViewLicenceService
 */

const FetchLicenceMonitoringStationsService = require('./fetch-licence-monitoring-stations.service.js')
const ViewLicencePresenter = require('../../presenters/monitoring-stations/view-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/monitoring-stations/{monitoringStationId}/licence/{licenceId}`
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} licenceId - The UUID of the licence
 * @param {string} monitoringStationId - The UUID of the monitoring station
 *
 * @returns {Promise<object>} The view data for the licence tag details page
 */
async function go(auth, licenceId, monitoringStationId) {
  const { licence, licenceMonitoringStations, monitoringStation } = await FetchLicenceMonitoringStationsService.go(
    licenceId,
    monitoringStationId
  )

  const formattedData = ViewLicencePresenter.go(licence, licenceMonitoringStations, monitoringStation, auth)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
