/**
 * Initiates the session record used for unlinking licences from an external user account
 * @module InitiateSessionService
 */

import CreateSessionDal from '../../../../dal/create-session.dal.js'
import FetchLicencesDal from '../../../../dal/users/external/setup/fetch-licences.dal.js'
import FetchUserDal from '../../../../dal/users/fetch-user.dal.js'

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
 * @param {string} back - The 'back' query parameter, used to indicate whether the user came from Search or Users
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
export default async function initiateSession(id, back) {
  const user = await FetchUserDal(id)

  const licences = await FetchLicencesDal(user.licenceEntityId)

  const activeNavBar = back === 'users' ? 'users' : 'search'

  const data = { activeNavBar, licences, selectedLicences: [], user }

  return CreateSessionDal(data)
}
