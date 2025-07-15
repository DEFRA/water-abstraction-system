'use strict'

/**
 * Formats a notice `SessionModel` instance into the data needed for a 'notice' record
 * @module CreateNoticePresenter
 */

const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Formats a notice `SessionModel` instance into the data needed for a 'notice' record
 *
 * We set the notice 'status' to 'complete' to allow the report to show on the 'notifications/report' page. This is
 * dictated by the legacy code.
 *
 * @param {SessionModel} session - The session instance
 * @param {object[]} recipients - List of recipient objects, each containing recipient details like email or name.
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} The data formatted persisting as a `notice` record
 */
function go(session, recipients, auth) {
  const { referenceCode, subType, name } = session

  const notice = {
    issuer: auth.credentials.user.username,
    licences: _licences(recipients),
    metadata: {
      name,
      recipients: recipients.length
    },
    referenceCode,
    status: 'completed',
    subtype: subType
  }

  if (session.journey === 'alerts') {
    notice.metadata.options = { sendingAlertType: session.alertType, monitoringStationId: session.monitoringStationId }
  } else {
    notice.metadata.options = { excludeLicences: session.removeLicences ? session.removeLicences : [] }
    notice.metadata.returnCycle = _returnCycle(session.determinedReturnsPeriod)
  }

  return notice
}

/**
 * All the licences associated with an event (licences that will receive notifications) are stored in
 * `water.events.licences`. It is not clear where these are used. But to be consistent we follow the established
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
