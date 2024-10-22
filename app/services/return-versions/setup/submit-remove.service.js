'use strict'

/**
 * Manages removing the return requirement from the session when remove is confirmed
 * @module SubmitRemoveService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Manages deleting the selected requirement in the session when remove is confirmed
 *
 * The return requirements session data is deleted when a user confirms via the cancellation button and the requirement
 * is deleted from the session in the database.
 *
 * @param {string} sessionId - The UUID for the return requirement setup session record
 * @param {number} requirementIndex - The index of the requirement being removed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise} the promise returned is not intended to resolve to any particular value
 */
async function go (sessionId, requirementIndex, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const notification = {
    title: 'Removed',
    text: 'Requirement removed'
  }

  yar.flash('notification', notification)

  return _removeRequirementFromSession(session, requirementIndex)
}

async function _removeRequirementFromSession (session, requirementIndex) {
  session.requirements.splice(requirementIndex, 1)

  return session.$update()
}

module.exports = {
  go
}
