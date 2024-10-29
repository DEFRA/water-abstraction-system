'use strict'

/**
 * Fetches the matching monitoring station and associated licences needed for the view monitoring-station page
 * @module FetchMonitoringStationService
 */

const MonitoringStationModel = require('../../models/monitoring-station.model.js')

/**
 * Fetches the matching monitoring station and associated licences needed for the view monitoring-station page
 *
 * @param {string} monitoringStationId - The UUID for the monitoring station to fetch
 *
 * @returns {Promise<module:MonitoringStationModel>} the matching `MonitoringStationModel` populated with the data
 * needed for the view monitoring station page
 */
async function go (monitoringStationId) {
  return _fetch(monitoringStationId)
}

async function _fetch (monitoringStationId) {
  return MonitoringStationModel.query()
    .findById(monitoringStationId)
    .select([
      'id',
      'gridReference',
      'label',
      'riverName',
      'stationReference',
      'wiskiId'
    ])
    .withGraphFetched('licenceMonitoringStations')
    .modifyGraph('licenceMonitoringStations', (builder) => {
      builder
        .select([
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
        .orderBy([
          { column: 'createdAt', order: 'desc' },
          { column: 'statusUpdatedAt', order: 'desc', nulls: 'last' }
        ])
    })
    .withGraphFetched('licenceMonitoringStations.licence')
    .modifyGraph('licenceMonitoringStations.licence', (builder) => {
      builder
        .select([
          'id',
          'licenceRef'
        ])
    })
}

module.exports = {
  go
}
