'use strict'

/**
 * Initiates the session record used for setting up a new returns notification
 * @module InitiateSessionService
 */

const SessionModel = require('../../../models/session.model.js')

const NOTIFICATION_TYPES = {
  invitations: {
    prefix: 'RINV-',
    type: 'Returns invitation',
    journey: 'invitations',
    redirectPath: 'returns-period'
  },
  reminders: {
    prefix: 'RREM-',
    type: 'Returns reminder',
    journey: 'reminders',
    redirectPath: 'returns-period'
  },
  'ad-hoc': {
    prefix: 'ADHC-',
    type: 'Ad hoc',
    journey: 'ad-hoc',
    redirectPath: 'ad-hoc-licence'
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
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(notificationType) {
  const { prefix, type, journey, redirectPath } = NOTIFICATION_TYPES[notificationType]

  const session = await SessionModel.query()
    .insert({
      data: {
        referenceCode: _generateReferenceCode(prefix),
        notificationType: type,
        journey
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
