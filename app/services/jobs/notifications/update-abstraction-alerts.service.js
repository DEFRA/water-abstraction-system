'use strict'

/**
 * Orchestrates the process of updating the licence monitoring stations last abstraction alert.
 * @module UpdateAbstractionAlertsService
 */

const LicenceMonitoringStationModel = require('../../../models/licence-monitoring-station.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Orchestrates the process of updating the licence monitoring stations last abstraction alert.
 *
 * When a notification is for water abstraction alerts it will have the 'messageRef' set as something like:
 * water_abstraction_alert_resume_email. When this is present we need to update the licence monitoring stations 'status'
 * and 'statusUpdatedAt'. This signifies the last abstraction alert sent.
 *
 * @param {object[]} notifications
 */
async function go(notifications) {
  for (const notification of notifications) {
    if (notification.messageRef?.includes('water_abstraction_alert'))
      await _update(notification.personalisation.licenceMonitoringStationId, notification.personalisation.alertType)
  }
}

async function _update(id, status) {
  await LicenceMonitoringStationModel.query().findById(id).patch({
    status,
    statusUpdatedAt: timestampForPostgres()
  })
}

module.exports = {
  go
}
