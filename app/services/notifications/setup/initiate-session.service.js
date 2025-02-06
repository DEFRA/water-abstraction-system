'use strict'

/**
 * Initiates the session record used for setting up a new returns notification
 * @module InitiateSessionService
 */

const SessionModel = require('../../../models/session.model.js')

const NOTIFICATION_TYPES = {
  invitation: {
    prefix: 'RINV-',
    type: 'Returns invitation'
  },
  reminder: {
    prefix: 'RREM-',
    type: 'Returns reminder'
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
 * This session will be used for both types of notifications (invitations and reminders). We set the prefix and type
 * for the upstream services to use e.g. the prefix and code are used in the filename of a csv file.
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go() {
  const { prefix, type } = NOTIFICATION_TYPES['invitation']

  return SessionModel.query()
    .insert({
      data: {
        referenceCode: _generateReferenceCode(prefix),
        notificationType: type
      }
    })
    .returning('id')
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
