'use strict'

/**
 * Orchestrates fetching and presenting the data for
 * `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 * @module LicenceService
 */

const FetchLicenceTagDetailsService = require('./fetch-licence-tag-details.service.js')
const LicencePresenter = require('../../presenters/monitoring-stations/licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data for
 * `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 *
 * It fetches details of the tags that have been applied to a licence for the selected monitoring station.
 *
 * @param {string} licenceId - The UUID of the licence record
 * @param {string} monitoringStationId - The UUID of the monitoring station record
 *
 * @returns {Promise<object>} The view data for the licence tag details page
 */
async function go(licenceId, monitoringStationId) {
  const { lastAlert, monitoringStationLicenceTags } = await FetchLicenceTagDetailsService.go(
    licenceId,
    monitoringStationId
  )

  const formattedData = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
