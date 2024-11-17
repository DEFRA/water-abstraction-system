'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/monitoring-stations/{id}` page
 * @module ViewService
 */

const FetchMonitoringStationService = require('../monitoring-stations/fetch-monitoring-station.service.js')
const ViewPresenter = require('../../presenters/monitoring-stations/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/monitoring-stations/{id}` page
 *
 * @param {string} monitoringStationId - The UUID for the monitoring station
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go (monitoringStationId, auth) {
  const monitoringStation = await FetchMonitoringStationService.go(monitoringStationId)

  const pageData = ViewPresenter.go(monitoringStation, auth)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
