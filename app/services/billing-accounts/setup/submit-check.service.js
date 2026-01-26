'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/check` page
 *
 * @module SubmitCheckService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session)

  return {}
}

async function _save(session) {
  return session.$update()
}

module.exports = {
  go
}
