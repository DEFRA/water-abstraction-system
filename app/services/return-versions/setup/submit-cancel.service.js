'use strict'

/**
 * Manages cancelling the return requirement session when cancel is confirmed
 * @module SubmitCancelService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Manages deleting the return requirement session when cancel is confirmed
 *
 * The return requirements session data is deleted when a user confirms via the cancellation button and the session is
 * deleted from the database.
 *
 * @param {string} sessionId - The UUID for the return requirement setup session record
 */
async function go(sessionId) {
  await SessionModel.query().deleteById(sessionId)
}

module.exports = {
  go
}
