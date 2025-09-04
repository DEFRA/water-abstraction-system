'use strict'

/**
 * Orchestrates fetching and presenting the data for `/monitoring-stations/{monitoringStationId}/licence/{licenceId}`
 * @module ViewLicenceService
 */

const FetchLicenceTagDetailsService = require('./fetch-licence-tag-details.service.js')
const LicencePresenter = require('../../presenters/monitoring-stations/licence.presenter.js')

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
  const { lastAlert, monitoringStationLicenceTags } = await FetchLicenceTagDetailsService.go(
    licenceId,
    monitoringStationId
  )

  const formattedData = LicencePresenter.go(auth, lastAlert, monitoringStationLicenceTags)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
