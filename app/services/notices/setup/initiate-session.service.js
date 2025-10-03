'use strict'

/**
 * Initiates the session record used for setting up a new notice
 * @module InitiateSessionService
 */

const DetermineLicenceMonitoringStationsService = require('./abstraction-alerts/determine-licence-monitoring-stations.service.js')
const DetermineNoticeTypeService = require('./determine-notice-type.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Initiates the session record used for setting up a new notice
 *
 * During the setup journey for a new returns notification we temporarily store the data in a `SessionModel` instance.
 * It is expected that on each page of the journey the GET will fetch the session record and use it to populate the
 * view. When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to create the notice and related
 * notifications and the session record itself deleted.
 *
 * This session will be used for all types of notices (invitations, reminders). We set the prefix and type for the
 * upstream services to use e.g. the prefix and code are used in the filename of a csv file.
 *
 * @param {string} journey - The notice journey to use; 'adhoc', 'standard' or 'alerts'
 * @param {string} [noticeType=null] - A string relating to one of the keys for `NOTIFICATION_TYPES`
 * @param {string} [monitoringStationId=null] - For abstraction alerts, the UUID of the monitoring station we are
 * creating an alert for
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(journey, noticeType = null, monitoringStationId = null) {
  const notice = _notice(journey, noticeType)

  let additionalData = {}

  if (monitoringStationId) {
    additionalData = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)
  }

  const session = await SessionModel.query()
    .insert({
      data: {
        ...additionalData,
        ...notice,
        journey
      }
    })
    .returning('id')

  return {
    sessionId: session.id,
    path: _redirect(journey)
  }
}

/**
 * The 'adhoc' journey does not have a noticeType set. This is set later in the journey.
 *
 * @private
 */
function _notice(journey, noticeType) {
  if (journey === 'alerts') {
    noticeType = 'abstractionAlerts'
  }

  if (noticeType) {
    return DetermineNoticeTypeService.go(noticeType)
  }

  return null
}

function _redirect(journey) {
  if (journey === 'standard') {
    return 'standard'
  }

  if (journey === 'alerts') {
    return 'abstraction-alerts/alert-type'
  }

  return 'licence'
}

module.exports = {
  go
}
