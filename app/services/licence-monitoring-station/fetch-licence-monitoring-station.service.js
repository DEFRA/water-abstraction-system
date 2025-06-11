'use strict'

/**
 * Fetches the matching licence monitoring station record needed for the remove licence tag page
 * @module FetchLicenceMonitoringStationService
 */

const LicenceMonitoringStationModel = require('../../models/licence-monitoring-station.model.js')

/**
 * Fetches the matching licence monitoring station record needed for the remove licence tag page
 *
 * @param {string} licenceMonitoringStationId - The UUID of the licence monitoring station record
 *
 * @returns {Promise<object>} the matching instance of the `LicenceMonitoringStationModel` populated with the data
 * needed for the remove licence tag page
 */
async function go(licenceMonitoringStationId) {
  const monitoringStationLicenceTags = await _fetchMonitoringStationLicenceTags(licenceMonitoringStationId)

  return monitoringStationLicenceTags
}

async function _fetchMonitoringStationLicenceTags(licenceMonitoringStationId) {
  return LicenceMonitoringStationModel.query()
    .findById(licenceMonitoringStationId)
    .select(['id', 'measureType', 'restrictionType', 'thresholdUnit', 'thresholdValue'])
    .withGraphFetched('monitoringStation')
    .modifyGraph('monitoringStation', (monitoringStationBuilder) => {
      monitoringStationBuilder.select(['id', 'catchmentName', 'label', 'riverName'])
    })
    .withGraphFetched('licence')
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
    .withGraphFetched('licenceVersionPurposeCondition')
    .modifyGraph('licenceVersionPurposeCondition', (licenceVersionPurposeConditionBuilder) => {
      licenceVersionPurposeConditionBuilder
        .select(['externalId'])
        .withGraphFetched('licenceVersionPurposeConditionType')
        .modifyGraph('licenceVersionPurposeConditionType', (licenceVersionPurposeConditionTypeBuilder) => {
          licenceVersionPurposeConditionTypeBuilder.select(['displayTitle'])
        })
    })
}

module.exports = {
  go
}
