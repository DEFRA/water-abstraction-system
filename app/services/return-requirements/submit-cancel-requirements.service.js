'use strict'

/**
 * Manages cancelling the return requirement session when cancel requirements is confirmed
 * @module SubmitCancelRequirementsService
 */

const SessionModel = require('../../models/session.model.js')

/**
 * Manages deleting the return requirement session when cancel requirements is confirmed
 *
 * After fetching the session instance for the return requirements journey in progress, it returns the licence id which
 * is used to return the user to the charge information page before the return requirements journey.
 *
 * The return requirements session data is deleted when a user confirms via the cancellation button and the session is
 * deleted from the database.
 *
 * @param {string} sessionId - The UUID for the return requirement setup session record
 *
 * @returns {string} The licence UUID
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const licenceId = session.licence.id

  await SessionModel.query().deleteById(sessionId)

  return licenceId
}

module.exports = {
  go
}
