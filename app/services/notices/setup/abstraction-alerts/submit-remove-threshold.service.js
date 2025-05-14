'use strict'

/**
 * Orchestrates validating the data for `` page
 *
 * @module SubmitRemoveThresholdService
 */

const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates validating the data for `` page
 *
 * @param {string} sessionId
 * @param {string} licenceMonitoringStationId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, licenceMonitoringStationId) {
  const session = await SessionModel.query().findById(sessionId)

  return session
}

module.exports = {
  go
}
