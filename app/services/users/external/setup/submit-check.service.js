/**
 * Orchestrates validating the data for the '/users/external/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

import DeleteSessionDal from '../../../../dal/delete-session.dal.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import UnregisterLicencesDal from '../../../../dal/users/external/setup/unregister-licences.dal.js'
import { flashNotification } from '../../../../lib/general.lib.js'

/**
 * Orchestrates validating the data for the '/users/external/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - the UUID of the session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} An object containing the URL to redirect the user to after confirming
 */
async function go(sessionId, yar, auth) {
  const sessionData = await FetchSessionDal.go(sessionId)

  await DeleteSessionDal.go(sessionId)

  await UnregisterLicencesDal.go(sessionData, auth.credentials.user)

  flashNotification(yar, 'Updated', 'Licences unregistered.')

  return { redirectUrl: `/system/users/external/${sessionData.user.id}/licences?back=${sessionData.activeNavBar}` }
}

export default {
  go
}
