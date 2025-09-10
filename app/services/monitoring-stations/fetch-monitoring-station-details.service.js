'use strict'

/**
 * Fetches the matching monitoring station and additional records needed for the view monitoring station page
 * @module FetchMonitoringStationDetailsService
 */

const LicenceMonitoringStationModel = require('../../models/licence-monitoring-station.model.js')
const MonitoringStationModel = require('../../models/monitoring-station.model.js')

/**
 * Fetches the matching monitoring station and additional records needed for the view monitoring station page
 *
 * @param {string} monitoringStationId - The UUID for the monitoring station to fetch
 *
 * @returns {Promise<object>} the matching instance of `MonitoringStationModel` and the `LicenceMonitoringStationModel`s
 * with the additional information needed for the view
 */
async function go(monitoringStationId) {
  const monitoringStation = await _fetchMonitoringStation(monitoringStationId)

  const licenceMonitoringStations = await _fetchLicenceMonitoringStations(monitoringStationId)

  return { licenceMonitoringStations, monitoringStation }
}

async function _fetchMonitoringStation(monitoringStationId) {
  return MonitoringStationModel.query()
    .findById(monitoringStationId)
    .select(['catchmentName', 'gridReference', 'id', 'label', 'riverName', 'stationReference', 'wiskiId'])
}

async function _fetchLicenceMonitoringStations(monitoringStationId) {
  return LicenceMonitoringStationModel.query()
    .select([
      'licenceMonitoringStations.id',
      'licenceMonitoringStations.abstractionPeriodEndDay',
      'licenceMonitoringStations.abstractionPeriodEndMonth',
      'licenceMonitoringStations.abstractionPeriodStartDay',
      'licenceMonitoringStations.abstractionPeriodStartMonth',
      'licenceMonitoringStations.measureType',
      'licenceMonitoringStations.restrictionType',
      'licenceMonitoringStations.thresholdUnit',
      'licenceMonitoringStations.thresholdValue'
    ])
    .select(
      LicenceMonitoringStationModel.relatedQuery('notifications')
        .select(
          LicenceMonitoringStationModel.knex().raw(`
            json_build_object(
              'createdAt', notifications.created_at,
              'id', notifications.id,
              'sendingAlertType', notifications.personalisation->>'sending_alert_type'
            )
          `)
        )
        .where('status', 'sent')
        .orderBy('created_at', 'desc')
        .limit(1)
        .as('latestNotification')
    )
    .join('licences', 'licenceMonitoringStations.licenceId', 'licences.id')
    .where('monitoringStationId', monitoringStationId)
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
}

module.exports = {
  go
}
