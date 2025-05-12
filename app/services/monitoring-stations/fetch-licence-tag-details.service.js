'use strict'

/**
 * Fetches the matching licence monitoring station and additional records needed for the licence tag details page
 * @module FetchLicenceTagDetailsService
 */

const MonitoringStationModel = require('../../models/monitoring-station.model.js')

/**
 * Fetches the matching licence monitoring station and additional records needed for the licence tag details page
 *
 * @param {string} licenceId - The UUID of the licence record
 * @param {string} monitoringStationId - The UUID of the monitoring station record
 *
 * @returns {Promise<module:MonitoringStationModel>} the matching instance of `MonitoringStationModel` populated with
 * the data needed for the licence tag details page
 */
async function go(licenceId, monitoringStationId) {
  return _fetch(licenceId, monitoringStationId)
}

async function _fetch(licenceId, monitoringStationId) {
  return MonitoringStationModel.query()
    .findById(monitoringStationId)
    .select(['id', 'catchmentName', 'gridReference', 'label', 'riverName', 'stationReference', 'wiskiId'])
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
        .whereNull('licenceMonitoringStations.deletedAt')
        .orderBy([
          { column: 'licences.licenceRef', order: 'asc' },
          { column: 'licenceMonitoringStations.thresholdValue', order: 'desc' }
        ])
        .withGraphFetched('licence')
        .modifyGraph('licence', (licenceBuilder) => {
          licenceBuilder.select(['id', 'licenceRef'])
        })
        .withGraphFetched('licenceVersionPurposeCondition')
        .modifyGraph('licenceVersionPurposeCondition', (licenceVersionPurposeConditionBuilder) => {
          licenceVersionPurposeConditionBuilder
            .select(['id'])
            .withGraphFetched('licenceVersionPurpose')
            .modifyGraph('licenceVersionPurpose', (licenceVersionPurposeBuilder) => {
              licenceVersionPurposeBuilder.select([
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
