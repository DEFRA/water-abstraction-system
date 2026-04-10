'use strict'

/**
 * Manages cancelling the return submission session when cancel is confirmed
 * @module SubmitCancelService
 */

const DeleteSessionDal = require('../../../dal/delete-session.dal.js')

/**
 * Manages cancelling the return submission session when cancel is confirmed
 *
 * The return submission session data is deleted from the database when a user confirms via the cancellation button.
 *
 * @param {string} sessionId - The UUID for the return submission setup session record
 */
async function go(sessionId) {
  await DeleteSessionDal.go(sessionId)
}

module.exports = {
  go
}
