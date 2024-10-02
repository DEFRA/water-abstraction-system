'use strict'

/**
 * Fetches the matching monitoring station and associated licences needed for the view
 * `/monitoring-stations/{monitoringStationId}` page
 * @module FetchMonitoringStationsService
 */

const GaugingStationModel = require('../../models/gauging-station.model.js')

/**
 * Fetches the matching monitoring station and associated licences needed for the view
 * `/monitoring-stations/{monitoringStationId}` page
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
        .orderBy([
          { column: 'createdAt', order: 'desc' },
          { column: 'statusUpdatedAt', order: 'desc', nulls: 'last' }
        ])
    })
    .withGraphFetched('licenceGaugingStations.licence')
    .modifyGraph('licenceGaugingStations.licence', (builder) => {
      builder.select([
        'id',
        'licenceRef'
      ])
    })
}

module.exports = {
  go
}
