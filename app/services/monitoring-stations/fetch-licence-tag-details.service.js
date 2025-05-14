'use strict'

/**
 * Fetches the matching licence monitoring station and additional records needed for the licence tag details page
 * @module FetchLicenceTagDetailsService
 */

const { ref } = require('objection')

const MonitoringStationModel = require('../../models/monitoring-station.model.js')
const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetches the matching licence monitoring station and additional records needed for the licence tag details page
 *
 * @param {string} licenceId - The UUID of the licence record
 * @param {string} monitoringStationId - The UUID of the monitoring station record
 *
 * @returns {Promise<object>} the matching instance of the `MonitoringStationModel` and `NotificationModel` populated
 * with the data needed for the licence tag details page
 */
async function go(licenceId, monitoringStationId) {
  const lastAlert = await _fetchLastAlert(licenceId)
  const licenceTags = await _fetchLicenceTags(licenceId, monitoringStationId)

  return { lastAlert, licenceTags }
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
      'status'
    ])
    .where(ref('personalisation:licenceId').castText(), licenceId)
    .where('status', 'sent')
    .whereLike('messageRef', 'water_abstraction_alert%')
    .orderBy('createdAt', 'desc') // Order by most recent first
    .first() // Return only the first result
}

async function _fetchLicenceTags(licenceId, monitoringStationId) {
  return MonitoringStationModel.query()
    .findById(monitoringStationId)
    .select(['id', 'label', 'riverName'])
    .withGraphFetched('licenceMonitoringStations')
    .modifyGraph('licenceMonitoringStations', (licenceMonitoringStationsBuilder) => {
      licenceMonitoringStationsBuilder
        .select([
          'licenceMonitoringStations.id',
          'licenceMonitoringStations.createdAt',
          'licenceMonitoringStations.createdBy',
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
          licenceBuilder.select(['id', 'licenceRef'])
        })
        .withGraphFetched('licenceVersionPurposeCondition')
        .modifyGraph('licenceVersionPurposeCondition', (licenceVersionPurposeConditionBuilder) => {
          licenceVersionPurposeConditionBuilder
            .select(['id', 'externalId', 'notes'])
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
    })
}

module.exports = {
  go
}
