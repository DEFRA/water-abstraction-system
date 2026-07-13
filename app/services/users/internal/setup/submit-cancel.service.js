/**
 * Orchestrates handling the data for `/users/internal/setup/{sessionId}/cancel` page
 * @module SubmitCancelService
 */

import DeleteSessionDal from '../../../../dal/delete-session.dal.js'

/**
 * Orchestrates handling the data for `/users/internal/setup/{sessionId}/cancel` page
 *
 * This service will delete the session record and provide the redirect url.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} An object containing the URL to redirect the user to after cancelling
 */
export default async function submitCancelService(sessionId) {
  await DeleteSessionDal(sessionId)

  return {
    redirectUrl: '/system/users'
  }
}
