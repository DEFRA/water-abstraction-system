/**
 * Orchestrates cancelling the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @module SubmitCancelService
 */

import DeleteSessionDal from 'water-abstraction-engine/dal/delete-session.dal.js'
import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

/**
 * Orchestrates cancelling the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} An object containing the URL to redirect the user to after cancelling
 */
export default async function submitCancelService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  await DeleteSessionDal(sessionId)

  const { user } = session

  return {
    redirectUrl: `/system/users/external/${user.id}/licences?back=${session.activeNavBar}`
  }
}
