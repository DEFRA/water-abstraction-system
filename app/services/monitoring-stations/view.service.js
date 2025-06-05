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
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(auth, monitoringStationId, yar) {
  const monitoringStation = await FetchMonitoringStationService.go(monitoringStationId)

  const pageData = ViewPresenter.go(auth, monitoringStation)

  const notification = yar.flash('notification')[0]

  return {
    activeNavBar: 'search',
    ...pageData,
    notification
  }
}

module.exports = {
  go
}
