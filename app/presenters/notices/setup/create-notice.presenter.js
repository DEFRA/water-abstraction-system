'use strict'

/**
 * Formats a notice `SessionModel` instance into the data needed for a 'notice' record
 * @module CreateNoticePresenter
 */

const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')
const { futureDueDate } = require('../base.presenter.js')

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

/**
 * Determines the return cycles period start, end and due dates for an invitation and reminder notice
 *
 * On the standard returns invitation and reminder journeys, all 3 dates are determined. What period the user selects
 * will determine the actual dates used.
 *
 * For ad-hoc invitations we don't care about the start and end dates. But we do need to calculate a due date. This is
 * set in the future depending on the message type we are sending (letter or an email).
 *
 * > NOTE - Due date will soon be calculated for _all_ notices. But that dynamic due dates is still being refined and
 * > developed.
 *
 * This is for the notice and not the individual notifications we do not know what type of notices we are sending
 * (letter / email). Therefore, we do not set the type and allow "futureDueDate" to handle this case (it will be set to
 * 28 days in the future).
 *
 * @private
 */
function _returnCycle(returnsPeriod) {
  const dueDate = futureDueDate()

  return {
    dueDate: returnsPeriod?.dueDate
      ? formatDateObjectToISO(new Date(returnsPeriod.dueDate))
      : formatDateObjectToISO(dueDate),
    endDate: returnsPeriod?.endDate ? formatDateObjectToISO(new Date(returnsPeriod.endDate)) : null,
    startDate: returnsPeriod?.startDate ? formatDateObjectToISO(new Date(returnsPeriod.startDate)) : null,
    ..._summer(returnsPeriod)
  }
}

function _summer(returnsPeriod) {
  if (!returnsPeriod) {
    return null
  }

  return {
    isSummer: returnsPeriod.summer === 'true'
  }
}

module.exports = {
  go
}
