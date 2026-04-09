'use strict'

/**
 * Orchestrates cancelling the data for `/notices/setup/{sessionId}/abstraction-alerts/` journey
 *
 * @module SubmitCancelAlertsService
 */

const DeleteSessionDal = require('../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates cancelling the data for `/notices/setup/{sessionId}/abstraction-alerts/` journey
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  await DeleteSessionDal.go(sessionId)

  return {
    monitoringStationId: session.monitoringStationId
  }
}

module.exports = {
  go
}
