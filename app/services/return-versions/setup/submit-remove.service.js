'use strict'

/**
 * Manages removing the return requirement from the session when remove is confirmed
 * @module SubmitRemoveService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Manages deleting the selected requirement in the session when remove is confirmed
 *
 * The return requirements session data is deleted when a user confirms via the cancellation button and the requirement
 * is deleted from the session in the database.
 *
 * @param {string} sessionId - The UUID for the return requirement setup session record
 * @param {number} requirementIndex - The index of the requirement being removed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(sessionId, requirementIndex, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const notification = {
    title: 'Removed',
    text: 'Requirement removed'
  }

  yar.flash('notification', notification)

  await _removeRequirementFromSession(session, requirementIndex)
}

async function _removeRequirementFromSession(session, requirementIndex) {
  session.requirements.splice(requirementIndex, 1)

  await session.$update()
}

module.exports = {
  go
}
