'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  return { session }
}

module.exports = {
  go
}
