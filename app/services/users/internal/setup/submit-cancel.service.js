'use strict'

/**
 * Orchestrates handling the data for `/users/internal/setup/{sessionId}/cancel` page
 * @module SubmitCancelService
 */

const DeleteSessionDal = require('../../../../dal/delete-session.dal.js')

/**
 * Orchestrates handling the data for `/users/internal/setup/{sessionId}/cancel` page
 *
 * This service will delete the session record and provide the redirect url.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<string>} - The redirect url
 */
async function go(sessionId) {
  await DeleteSessionDal.go(sessionId)

  return '/system/users'
}

module.exports = {
  go
}
