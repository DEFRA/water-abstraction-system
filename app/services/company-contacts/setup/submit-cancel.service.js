'use strict'

/**
 * Orchestrates cancelling the data for '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @module SubmitCancelService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates cancelling the data for '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { company } = session

  await SessionModel.query().delete().where('id', sessionId)

  return {
    redirectUrl: `/system/companies/${company.id}/contacts`
  }
}

module.exports = {
  go
}
