'use strict'

/**
 * Initiates the session record used for unlinking licences from an external user account
 * @module InitiateSessionService
 */

const SessionModel = require('../../../../models/session.model.js')

/**
 * Initiates the session record used for unlinking licences from an external user account
 *
 * During the setup journey for unlinking licences from an external user account, we temporarily store the data in a
 * `SessionModel` instance. It is expected that on each page of the journey the GET will fetch the session record and
 * use it to populate the view. When the page is submitted the session record will be updated with the next piece of
 * data.
 *
 * At the end when the journey is complete the data from the session will be used to unlink the licences and the session
 * record itself deleted.
 *
 * @param {string} id - the UUID of the user
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(id) {
  return SessionModel.query()
    .insert({ data: { selectedLicences: [], userId: id } })
    .returning('id')
}

module.exports = {
  go
}
