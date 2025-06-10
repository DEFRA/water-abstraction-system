'use strict'

/**
 * Fetches the data needed for the monitoring station abstraction alert journey
 * @module FetchMonitoringStationService
 */

const MonitoringStationModel = require('../../../../models/monitoring-station.model.js')

/**
 * Fetches the data needed for the monitoring station abstraction alert journey
 *
 * @param {string} monitoringStationId - The UUID for the monitoring station to fetch
 *
 * @returns {Promise<module:MonitoringStationModel>} the matching instance of `MonitoringStationModel` populated with
 * the data needed for the abstraction alert journey
 */
async function go(monitoringStationId) {
  return _fetch(monitoringStationId)
}

async function _fetch(monitoringStationId) {
  return MonitoringStationModel.query()
    .findById(monitoringStationId)
    .select(['id', 'label', 'riverName'])
    .withGraphFetched('licenceMonitoringStations')
    .modifyGraph('licenceMonitoringStations', (licenceMonitoringStationsBuilder) => {
      licenceMonitoringStationsBuilder
        .select([
          'licenceMonitoringStations.id',
          'licenceMonitoringStations.abstractionPeriodEndDay',
          'licenceMonitoringStations.abstractionPeriodEndMonth',
          'licenceMonitoringStations.abstractionPeriodStartDay',
          'licenceMonitoringStations.abstractionPeriodStartMonth',
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
          licenceBuilder.select(['licenceRef', 'id'])
        })
        .withGraphFetched('licenceVersionPurposeCondition')
        .modifyGraph('licenceVersionPurposeCondition', (licenceVersionPurposeConditionBuilder) => {
          licenceVersionPurposeConditionBuilder
            .select(['id', 'notes'])
            .withGraphFetched('licenceVersionPurpose')
            .modifyGraph('licenceVersionPurpose', (licenceVersionPurposeBuilder) => {
              licenceVersionPurposeBuilder.select([
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
