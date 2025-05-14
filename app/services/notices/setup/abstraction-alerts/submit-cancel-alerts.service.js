'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 *
 * @module SubmitCancelAlertsService
 */

const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  await SessionModel.query().delete().where('id', sessionId)
}

module.exports = {
  go
}
