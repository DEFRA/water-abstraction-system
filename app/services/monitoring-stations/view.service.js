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
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} monitoringStationId - The UUID for the monitoring station
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go (auth, monitoringStationId) {
  const fetchLicences = await FetchMonitoringStationService.go(monitoringStationId)

  const pageData = ViewPresenter.go(auth, fetchLicences)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
