'use strict'

/**
 * Fetches the licence monitoring stations, plus the parent licence and monitoring station for view licence page
 * @module FetchLicenceMonitoringStationsService
 */

const LicenceModel = require('../../models/licence.model.js')
const LicenceMonitoringStationModel = require('../../models/licence-monitoring-station.model.js')
const MonitoringStationModel = require('../../models/monitoring-station.model.js')

/**
 * Fetches the licence monitoring stations, plus the parent licence and monitoring station for view licence page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {string} monitoringStationId - The UUID of the monitoring station
 *
 * @returns {Promise<object>} the matching instance of the `MonitoringStationModel`, `LicenceModel` and associated
 * `LicenceMonitoringStationModel` instances
 */
async function go(licenceId, monitoringStationId) {
  const licence = await _fetchLicence(licenceId)
  const monitoringStation = await _fetchMonitoringStation(monitoringStationId)
  const licenceMonitoringStations = await _fetchLicenceMonitoringStations(licenceId, monitoringStationId)

  return { licence, licenceMonitoringStations, monitoringStation }
}

async function _fetchLicence(monitoringStationId) {
  return LicenceModel.query().findById(monitoringStationId).select(['id', 'licenceRef'])
}

async function _fetchLicenceMonitoringStations(licenceId, monitoringStationId) {
  return LicenceMonitoringStationModel.query()
    .select(['createdAt', 'id', 'restrictionType', 'status', 'statusUpdatedAt', 'thresholdUnit', 'thresholdValue'])
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
    .where('licenceId', licenceId)
    .where('monitoringStationId', monitoringStationId)
    .whereNull('deletedAt')
    .orderBy([{ column: 'thresholdValue', order: 'desc' }])
    .withGraphFetched('licenceVersionPurposeCondition')
    .modifyGraph('licenceVersionPurposeCondition', (licenceVersionPurposeConditionBuilder) => {
      licenceVersionPurposeConditionBuilder
        .select(['externalId', 'id', 'notes'])
        .withGraphFetched('licenceVersionPurpose')
        .modifyGraph('licenceVersionPurpose', (licenceVersionPurposeBuilder) => {
          licenceVersionPurposeBuilder
            .select(['id'])
            .withGraphFetched('licenceVersion')
            .modifyGraph('licenceVersion', (licenceVersionBuilder) => {
              licenceVersionBuilder.select(['id', 'status'])
            })
        })
        .withGraphFetched('licenceVersionPurposeConditionType')
        .modifyGraph('licenceVersionPurposeConditionType', (licenceVersionPurposeConditionTypeBuilder) => {
          licenceVersionPurposeConditionTypeBuilder.select(['id', 'displayTitle'])
        })
    })
    .withGraphFetched('user')
    .modifyGraph('user', (userBuilder) => {
      userBuilder.select(['id', 'username'])
    })
}

async function _fetchMonitoringStation(monitoringStationId) {
  return MonitoringStationModel.query().findById(monitoringStationId).select(['id', 'label', 'riverName'])
}

module.exports = {
  go
}
