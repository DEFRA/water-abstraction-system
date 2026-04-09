'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/check` page
 *
 * @module SubmitCheckService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  await _save(session)

  return {}
}

async function _save(session) {
  return session.$update()
}

module.exports = {
  go
}
