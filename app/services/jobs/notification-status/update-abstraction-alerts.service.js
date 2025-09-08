'use strict'

/**
 * Orchestrates the process of updating the licence monitoring stations last abstraction alert.
 * @module UpdateAbstractionAlertsService
 */

const LicenceMonitoringStationModel = require('../../../models/licence-monitoring-station.model.js')

/**
 * Orchestrates the process of updating the licence monitoring stations last abstraction alert.
 *
 * When a notification is for water abstraction alerts it will have the 'messageRef' set as something like:
 * 'water_abstraction_alert_resume_email'. When this is present we need to update the licence monitoring stations
 * 'status' and 'statusUpdatedAt'. This signifies the last abstraction alert sent.
 *
 * If a notification has failed to send (Notify has sent an error) then we do not update.
 *
 * @param {object[]} notifications
 */
async function go(notifications) {
  const toUpdateStations = _stations(notifications)

  await Promise.all(toUpdateStations)
}

/**
 * Determine which notifications are for the water abstraction alerts and have not failed to send.
 * @private
 */
function _stations(notifications) {
  const stationsToUpdate = notifications.filter((notification) => {
    return notification.messageRef?.includes('water_abstraction_alert') && notification.status !== 'error'
  })

  return stationsToUpdate.map((notification) => {
    const { createdAt, personalisation } = notification
    return LicenceMonitoringStationModel.query().findById(personalisation.licenceGaugingStationId).patch({
      status: personalisation.sending_alert_type,
      statusUpdatedAt: createdAt
    })
  })
}

module.exports = {
  go
}
