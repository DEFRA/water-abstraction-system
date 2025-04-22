'use strict'

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/cancel` page
 * @module SubmitCancelService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/cancel` page
 *
 * This service will delete the session record.
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 */
async function go(sessionId) {
  await SessionModel.query().delete().where('id', sessionId)
}

module.exports = {
  go
}
