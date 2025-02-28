'use strict'

/**
 * Formats the session data to create an event for 'wabs.public.events'
 * @module CreateEventPresenter
 */

const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Formats the session data to create an event for 'wabs.public.events'
 *
 * @param {SessionModel} session
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { referenceCode, recipients, determinedReturnsPeriod, journey, removeLicences = [] } = session

  return {
    licences: _licences(recipients),
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
 * 'wabs.water.events.licences'. It is not clear where theses are used. But to be consistent we follow the established
 * pattern.
 *
 * @private
 */
function _licences(recipients) {
  return recipients.flatMap((recipient) => {
    return transformStringOfLicencesToArray(recipient.licence_refs)
  })
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
    dueDate: returnsPeriod.dueDate,
    endDate: returnsPeriod.endDate,
    isSummer: returnsPeriod.summer,
    startDate: returnsPeriod.startDate
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
