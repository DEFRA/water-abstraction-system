/**
 * Initiates the session record used for creating a new internal user account
 * @module InitiateSessionService
 */

import CreateSessionDal from '../../../../dal/create-session.dal.js'

/**
 * Initiates the session record used for creating a new internal user account
 *
 * During the setup journey for creating an internal user we temporarily store the data in a `SessionModel` instance. It
 * is expected that on each page of the journey the GET will fetch the session record and use it to populate the view.
 * When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to create the user and the session
 * record itself deleted.
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go() {
  return CreateSessionDal.go()
}

export {
  go
}
export default {
  go
}
