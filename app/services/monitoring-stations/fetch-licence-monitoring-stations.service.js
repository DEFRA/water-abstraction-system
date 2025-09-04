'use strict'

/**
 * Fetches the matching monitoring station and additional records needed for the view licence page
 * @module FetchLicenceMonitoringStationsService
 */

const { ref } = require('objection')

const MonitoringStationModel = require('../../models/monitoring-station.model.js')
const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetches the matching monitoring station and additional records needed for the view licence page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {string} monitoringStationId - The UUID of the monitoring station
 *
 * @returns {Promise<object>} the matching instance of the `MonitoringStationModel` and `NotificationModel` populated
 * with the data needed for the view licence page
 */
async function go(licenceId, monitoringStationId) {
  const lastAlert = await _fetchLastAlert(licenceId)
  const monitoringStationLicenceTags = await _fetchMonitoringStationLicenceTags(licenceId, monitoringStationId)

  return { lastAlert, monitoringStationLicenceTags }
}

async function _fetchLastAlert(licenceId) {
  return NotificationModel.query()
    .select([
      'id',
      ref('personalisation:alertType').castText().as('alertType'),
      ref('personalisation:address_line_1').castText().as('contact'),
      'createdAt',
      'messageRef',
      'messageType',
      'recipient',
      ref('personalisation:sending_alert_type').castText().as('sendingAlertType'),
      'status'
    ])
    .where(ref('personalisation:licenceId').castText(), licenceId)
    .where('status', 'sent')
    .whereLike('messageRef', 'water_abstraction_alert%')
    .orderBy('createdAt', 'desc') // Order by most recent first
    .first() // Return only the first result
}

async function _fetchMonitoringStationLicenceTags(licenceId, monitoringStationId) {
  return MonitoringStationModel.query()
    .findById(monitoringStationId)
    .select(['id', 'label', 'riverName'])
    .withGraphFetched('licenceMonitoringStations')
    .modifyGraph('licenceMonitoringStations', (licenceMonitoringStationsBuilder) => {
      licenceMonitoringStationsBuilder
        .select([
          'licenceMonitoringStations.id',
          'licenceMonitoringStations.createdAt',
          'licenceMonitoringStations.licenceId',
          'licenceMonitoringStations.restrictionType',
          'licenceMonitoringStations.thresholdUnit',
          'licenceMonitoringStations.thresholdValue'
        ])
        .whereNull('licenceMonitoringStations.deletedAt')
        .where('licenceMonitoringStations.licenceId', licenceId)
        .orderBy([{ column: 'licenceMonitoringStations.thresholdValue', order: 'desc' }])
        .withGraphFetched('licence')
        .modifyGraph('licence', (licenceBuilder) => {
          licenceBuilder.select(['licenceRef'])
        })
        .withGraphFetched('licenceVersionPurposeCondition')
        .modifyGraph('licenceVersionPurposeCondition', (licenceVersionPurposeConditionBuilder) => {
          licenceVersionPurposeConditionBuilder
            .select(['externalId', 'notes'])
            .withGraphFetched('licenceVersionPurpose')
            .modifyGraph('licenceVersionPurpose', (licenceVersionPurposeBuilder) => {
              licenceVersionPurposeBuilder
                .select(['id'])
                .withGraphFetched('licenceVersion')
                .modifyGraph('licenceVersion', (licenceVersionBuilder) => {
                  licenceVersionBuilder.select(['status'])
                })
            })
            .withGraphFetched('licenceVersionPurposeConditionType')
            .modifyGraph('licenceVersionPurposeConditionType', (licenceVersionPurposeConditionTypeBuilder) => {
              licenceVersionPurposeConditionTypeBuilder.select(['displayTitle'])
            })
        })
        .withGraphFetched('user')
        .modifyGraph('user', (userBuilder) => {
          userBuilder.select(['username'])
        })
    })
}

module.exports = {
  go
}
