'use strict'

/**
 * Formats a notification `SessionModel` instance into the data needed for a 'EventModel' record
 * @module CreateEventPresenter
 */

const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Formats a notification `SessionModel` instance into the data needed for a 'EventModel' record
 *
 * @param {SessionModel} session
 * @param {object[]} recipients
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, recipients, auth) {
  const { referenceCode, determinedReturnsPeriod, journey, removeLicences = [] } = session

  return {
    licences: _licences(recipients),
    issuer: auth.credentials.user.username,
    metadata: {
      name: _name(journey),
      options: {
        excludeLicences: removeLicences
      },
      recipients: recipients.length,
      returnCycle: _returnCycle(determinedReturnsPeriod)
    },
    referenceCode,
    status: 'started',
    subtype: _subType(journey)
  }
}

/**
 * All the licences associated with an event (licences that will receive notifications) are stored in
 * `water.events.licences`. It is not clear where theses are used. But to be consistent we follow the established
 * pattern.
 *
 * These licences are stored as 'jsonb' so we need to stringify the array to match the schema.
 *
 * @private
 */
function _licences(recipients) {
  const formattedRecipients = recipients.flatMap((recipient) => {
    return transformStringOfLicencesToArray(recipient.licence_refs)
  })

  return JSON.stringify(formattedRecipients)
}

/**
 * This name is used in the legacy UI to render the notification type on '/notifications/report'.
 * This has been done to allow all types of notifications to be rendered in the UI. The data is taken straight from the
 * metadata and rendered in the view.
 *
 * We need to be consistent with this pattern.
 *
 * @private
 */
function _name(journey) {
  if (journey === 'invitations') {
    return 'Returns: invitation'
  } else if (journey === 'reminders') {
    return 'Returns: reminder'
  } else {
    return ''
  }
}

function _returnCycle(returnsPeriod) {
  return {
    dueDate: formatDateObjectToISO(new Date(returnsPeriod.dueDate)),
    endDate: formatDateObjectToISO(new Date(returnsPeriod.endDate)),
    isSummer: returnsPeriod.summer === 'true',
    startDate: formatDateObjectToISO(new Date(returnsPeriod.startDate))
  }
}

/**
 *
 * The legacy code has the concept of 'subType' this is used when querying to get notifications.
 *
 * Below is an example of a query used in 'water-abstraction-service'.
 *
 * ```sql
 * SELECT * FROM water.scheduled_notification
 *     WHERE event_id = (SELECT event_id FROM water.events
 *       WHERE subtype = 'returnInvitation'
 *       AND status = 'completed'
 *       ORDER BY created DESC LIMIT 1)
 *     AND licences \\? :licenceRef
 * ```
 *
 * @private
 */
function _subType(journey) {
  if (journey === 'invitations') {
    return 'returnInvitation'
  } else if (journey === 'reminders') {
    return 'returnReminder'
  } else {
    return ''
  }
}

module.exports = {
  go
}
