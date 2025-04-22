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
 * We set the event 'status' to 'complete' to allow the report to show on the 'notifications/report' page. This is
 * dictated by the legacy code.
 *
 * @param {SessionModel} session
 * @param {object[]} recipients
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, recipients, auth) {
  const { referenceCode, determinedReturnsPeriod, removeLicences = [], subType, name } = session

  return {
    issuer: auth.credentials.user.username,
    licences: _licences(recipients),
    metadata: {
      name,
      options: {
        excludeLicences: removeLicences
      },
      recipients: recipients.length,
      returnCycle: _returnCycle(determinedReturnsPeriod)
    },
    referenceCode,
    status: 'completed',
    subtype: subType
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

function _returnCycle(returnsPeriod) {
  return {
    dueDate: formatDateObjectToISO(new Date(returnsPeriod.dueDate)),
    endDate: formatDateObjectToISO(new Date(returnsPeriod.endDate)),
    isSummer: returnsPeriod.summer === 'true',
    startDate: formatDateObjectToISO(new Date(returnsPeriod.startDate))
  }
}

module.exports = {
  go
}
