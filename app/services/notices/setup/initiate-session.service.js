'use strict'

/**
 * Initiates the session record used for setting up a new returns notification
 * @module InitiateSessionService
 */

const DetermineLicenceMonitoringStationsService = require('./abstraction-alerts/determine-licence-monitoring-stations.service.js')
const DetermineNoticeTypeService = require('./determine-notice-type.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Initiates the session record used for setting up a new returns notification
 *
 * During the setup journey for a new returns notification we temporarily store the data in a `SessionModel`
 * instance. It is expected that on each page of the journey the GET will fetch the session record and use it to
 * populate the view.
 * When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to create the returns
 * notification and the session record itself deleted.
 *
 * This session will be used for all types of notifications (invitations, reminders). We set the prefix and type
 * for the upstream services to use e.g. the prefix and code are used in the filename of a csv file.
 *
 * @param {string} notificationType - A string relating to one of the keys for `NOTIFICATION_TYPES`
 * @param {string} [monitoringStationId=null] - The UUID of the monitoring station we are creating an alert for
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(notificationType, monitoringStationId = null) {
  if (notificationType === 'ad-hoc') {
    return _adHoc()
  }

  const { redirectPath, ...noticeType } = DetermineNoticeTypeService.go(notificationType)

  let additionalData = {}

  if (monitoringStationId) {
    additionalData = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)
  }

  const session = await SessionModel.query()
    .insert({
      data: {
        ...additionalData,
        ...noticeType
      }
    })
    .returning('id')

  return {
    sessionId: session.id,
    path: `${redirectPath}`
  }
}

async function _adHoc() {
  const session = await SessionModel.query().insert({ data: {} }).returning('id')

  return {
    sessionId: session.id,
    path: `licence`
  }
}
module.exports = {
  go
}
