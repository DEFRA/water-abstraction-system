'use strict'

/**
 * Fetches the matching monitoring station and additional records needed for the view monitoring station page
 * @module FetchMonitoringStationService
 */

const MonitoringStationModel = require('../../models/monitoring-station.model.js')

/**
 * Fetches the matching monitoring station and additional records needed for the view monitoring station page
 *
 * @param {string} monitoringStationId - The UUID for the monitoring station to fetch
 *
 * @returns {Promise<module:MonitoringStationModel>} the matching instance of `MonitoringStationModel` populated with
 * the data needed for the view monitoring station page
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
    .modifyGraph('licenceMonitoringStations', (licenceMonitoringStationsBuilder) => {
      licenceMonitoringStationsBuilder
        .select([
          'licenceMonitoringStations.id',
          'licenceMonitoringStations.abstractionPeriodEndDay',
          'licenceMonitoringStations.abstractionPeriodEndMonth',
          'licenceMonitoringStations.abstractionPeriodStartDay',
          'licenceMonitoringStations.abstractionPeriodStartMonth',
          'licenceMonitoringStations.licenceId',
          'licenceMonitoringStations.measureType',
          'licenceMonitoringStations.restrictionType',
          'licenceMonitoringStations.status',
          'licenceMonitoringStations.statusUpdatedAt',
          'licenceMonitoringStations.thresholdUnit',
          'licenceMonitoringStations.thresholdValue'
        ])
        .join('licences', 'licenceMonitoringStations.licenceId', 'licences.id')
        .orderBy([
          { column: 'licences.licenceRef', order: 'asc' },
          { column: 'licenceMonitoringStations.thresholdValue', order: 'desc' }
        ])
        .withGraphFetched('licence')
        .modifyGraph('licence', (licenceBuilder) => {
          licenceBuilder
            .select([
              'id',
              'licenceRef'
            ])
        })
        .withGraphFetched('licenceVersionPurposeCondition')
        .modifyGraph('licenceVersionPurposeCondition', (licenceVersionPurposeConditionBuilder) => {
          licenceVersionPurposeConditionBuilder
            .select([
              'id'
            ])
            .withGraphFetched('licenceVersionPurpose')
            .modifyGraph('licenceVersionPurpose', (licenceVersionPurposeBuilder) => {
              licenceVersionPurposeBuilder
                .select([
                  'id',
                  'abstractionPeriodEndDay',
                  'abstractionPeriodEndMonth',
                  'abstractionPeriodStartMonth',
                  'abstractionPeriodStartDay'
                ])
            })
        })
    })
}

module.exports = {
  go
}
