'use strict'

/**
 * Orchestrates cancelling the data for `/notices/setup/{sessionId}/abstraction-alerts/` journey
 *
 * @module SubmitCancelAlertsService
 */

const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates cancelling the data for `/notices/setup/{sessionId}/abstraction-alerts/` journey
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { monitoringStationId } = session

  await SessionModel.query().delete().where('id', sessionId)

  return {
    monitoringStationId
  }
}

module.exports = {
  go
}
