'use strict'

/**
 * Initiates the session record used for setting up a new returns notification
 * @module InitiateSessionService
 */

const DetermineLicenceMonitoringStationsService = require('./abstraction-alerts/determine-licence-monitoring-stations.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Defines the configuration for supported notification types.
 *
 * This structure enables consistent handling and display of different notification types
 * across the system. Each type includes legacy fields (`name` and `subType`) required for backwards compatibility.
 *
 * Legacy context:
 * - `name` is used in the legacy UI to render the notification type on `/notifications/report`
 * - `subType` is used when querying notifications in the legacy system
 *
 * @private
 */
const NOTIFICATION_TYPES = {
  invitations: {
    journey: 'invitations',
    name: 'Returns: invitation',
    prefix: 'RINV-',
    redirectPath: 'returns-period',
    subType: 'returnInvitation',
    type: 'Returns invitation'
  },
  reminders: {
    journey: 'reminders',
    name: 'Returns: reminder',
    prefix: 'RREM-',
    redirectPath: 'returns-period',
    subType: 'returnReminder',
    type: 'Returns reminder'
  },
  'ad-hoc': {
    journey: 'ad-hoc',
    name: 'Returns: ad-hoc',
    prefix: 'ADHC-',
    redirectPath: 'ad-hoc-licence',
    subType: 'adHocReminder',
    type: 'Ad hoc'
  },
  'abstraction-alert': {
    journey: 'abstraction-alert',
    name: 'Water abstraction alert',
    prefix: 'WAA-',
    redirectPath: 'abstraction-alerts/alert-type',
    subType: 'waterAbstractionAlerts',
    type: 'Abstraction alert'
  }
}

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
 * This session will be used for all types of notifications (invitations, reminders and ad-hoc). We set the prefix and type
 * for the upstream services to use e.g. the prefix and code are used in the filename of a csv file.
 *
 * @param {string} notificationType - A string relating to one of the keys for `NOTIFICATION_TYPES`
 * @param {string} [monitoringStationId=null] - The UUID of the monitoring station we are creating an alert for
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(notificationType, monitoringStationId = null) {
  const { journey, name, prefix, redirectPath, subType, type } = NOTIFICATION_TYPES[notificationType]

  let additionalData = {}

  if (monitoringStationId) {
    additionalData = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)
  }

  const session = await SessionModel.query()
    .insert({
      data: {
        ...additionalData,
        journey,
        name,
        notificationType: type,
        referenceCode: _generateReferenceCode(prefix),
        subType
      }
    })
    .returning('id')

  return {
    sessionId: session.id,
    path: `${redirectPath}`
  }
}

/**
 * A function to generate a pseudo-unique reference code for recipients notifications
 *
 * @param {string} prefix
 *
 * @returns {string} A reference code with a prefix and random string (RINV-A14GB8)
 */
function _generateReferenceCode(prefix) {
  const possible = 'ABCDEFGHJKLMNPQRTUVWXYZ0123456789'
  const length = 6
  let text = ''

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return prefix + text
}

module.exports = {
  go
}
