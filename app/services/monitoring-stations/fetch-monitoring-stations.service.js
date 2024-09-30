'use strict'

/**
 * Fetches the matching monitoring station and associated licences needed for the view
 * `/monitoring-stations/{monitoringStationId}/view` page
 * @module FetchLicenceService
 */

const GaugingStationModel = require('../../models/gauging-station.model.js')

/**
 * Fetches the matching monitoring station and associated licences needed for the view
 * `/monitoring-stations/{monitoringStationId}/view` page
 *
 * @param {string} monitoringStationId - The UUID for the monitoring station to fetch
 *
 * @returns {Promise<module:GaugingStationModel>} the matching `GaugingStationModel` populated with the data needed for
 * the view monitoring station page
 */
async function go (monitoringStationId) {
  return _fetch(monitoringStationId)
}

async function _fetch (monitoringStationId) {
  return GaugingStationModel.query()
    .findById(monitoringStationId)
    .select([
      'id',
      'gridReference',
      'label',
      'riverName',
      'stationReference',
      'wiskiId'
    ])
    .withGraphFetched('licenceGaugingStations')
    .modifyGraph('licenceGaugingStations', (builder) => {
      builder.select([
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'alertType',
        'createdAt',
        'restrictionType',
        'statusUpdatedAt',
        'thresholdUnit',
        'thresholdValue'
      ])
        .orderBy('createdAt', 'desc')
        .orderBy('statusUpdatedAt', 'desc')
        .withGraphFetched('licence')
        .modifyGraph('licence', (builder) => {
          builder.select([
            'id',
            'licenceRef'
          ])
        })
    })
}

module.exports = {
  go
}
