/**
 * Manages cancelling the return requirement session when cancel is confirmed
 * @module SubmitCancelService
 */

import DeleteSessionDal from '../../../dal/delete-session.dal.js'

/**
 * Manages deleting the return requirement session when cancel is confirmed
 *
 * The return requirements session data is deleted when a user confirms via the cancellation button and the session is
 * deleted from the database.
 *
 * @param {string} sessionId - The UUID for the return requirement setup session record
 */
async function go(sessionId) {
  await DeleteSessionDal.go(sessionId)
}

export {
  go
}
export default {
  go
}
