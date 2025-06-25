'use strict'

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module SubmitCheckService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  // TODO: Add tag to licence
  // TODO: Ensure success banner is displayed when we return to the monitoring stations page

  await session.$query().delete()

  return session.licenceId
}

module.exports = {
  go
}
