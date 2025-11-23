'use strict'

/**
 * Initiates the session record used for setting up a new notice
 * @module InitiateSessionService
 */

const DetermineLicenceMonitoringStationsService = require('./abstraction-alerts/determine-licence-monitoring-stations.service.js')
const SessionModel = require('../../../models/session.model.js')
const { generateNoticeReferenceCode } = require('../../../lib/general.lib.js')
const { NoticeJourney, NoticeType, NoticeTypes } = require('../../../lib/static-lookups.lib.js')

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
 * This session will be used for all types of notices (invitations, reminders, abstraction alerts and paper returns). We
 * set the prefix and type for the upstream services to use e.g. the prefix and code are used in the filename of a csv
 * file.
 *
 * @param {string} journey - The notice journey to use; 'adhoc', 'standard' or 'alerts'
 * @param {string} [monitoringStationId=null] - For abstraction alerts, the UUID of the monitoring station we are
 * creating an alert for
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(journey, monitoringStationId = null) {
  const noticeProperties = _noticeProperties(journey)

  let additionalData = {}

  if (monitoringStationId) {
    additionalData = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)
  }

  const session = await SessionModel.query()
    .insert({
      data: {
        ...additionalData,
        ...noticeProperties,
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
 * The 'standard' and 'adhoc' journeys do not have a noticeType set as it is selected later in the journey.
 *
 * @private
 */
function _noticeProperties(journey) {
  if (journey !== NoticeJourney.ALERTS) {
    return null
  }

  const { name, prefix, subType, notificationType } = NoticeTypes[NoticeType.ABSTRACTION_ALERTS]

  return {
    name,
    noticeType: NoticeType.ABSTRACTION_ALERTS,
    notificationType,
    referenceCode: generateNoticeReferenceCode(prefix),
    subType
  }
}

function _redirect(journey) {
  if (journey === NoticeJourney.STANDARD) {
    return 'notice-type'
  }

  if (journey === NoticeJourney.ALERTS) {
    return 'abstraction-alerts/alert-type'
  }

  // Ad-hoc
  return 'licence'
}

module.exports = {
  go
}
