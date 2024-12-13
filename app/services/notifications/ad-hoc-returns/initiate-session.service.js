'use strict'

/**
 * Initiates the session record used for setting up a new ad-hoc returns notification
 * @module InitiateSessionService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Initiates the session record used for setting up a new ad-hoc returns notification
 *
 * During the setup journey for a new ad-hoc returns notification we temporarily store the data in a `SessionModel`
 * instance. It is expected that on each page of the journey the GET will fetch the session record and use it to
 * populate the view.
 * When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to create the ad-hoc returns
 * notification and the session record itself deleted.
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go() {
  // NOTE: data defaults to {} when a new record is created. But Objection.js throws a 'The query is empty' if we pass
  // nothing into `insert()`.
  return SessionModel.query().insert({ data: {} }).returning('id')
}

module.exports = {
  go
}
