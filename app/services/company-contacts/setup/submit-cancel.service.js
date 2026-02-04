'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @module SubmitCancelService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  return {
    redirectUrl: `/system/companies/${session.company.id}/contacts`
  }
}

module.exports = {
  go
}
