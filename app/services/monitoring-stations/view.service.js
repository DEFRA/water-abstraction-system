'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/monitoring-stations/{id}` page
 * @module ViewService
 */

const FetchMonitoringStationsService = require('../monitoring-stations/fetch-monitoring-stations.service.js')
const ViewMonitoringStationPresenter = require('../../presenters/monitoring-stations/view-monitoring-stations.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/monitoring-stations/{id}` page
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} monitoringStationId - The UUID for the monitoring station
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go (auth, monitoringStationId) {
  const fetchLicences = await FetchMonitoringStationsService.go(monitoringStationId)

  const pageData = ViewMonitoringStationPresenter.go(auth, fetchLicences)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
