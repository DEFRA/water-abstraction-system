'use strict'

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/cancel` page
 * @module SubmitCancelService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/cancel` page
 *
 * This service will delete the session record and provide the redirect url.
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 *
 * @returns {Promise<string>} - returns the redirect url, which can contain some session data that needs to be deleted
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await SessionModel.query().delete().where('id', sessionId)

  if (session.journey === 'abstraction-alert') {
    return `/system/monitoring-stations/${session.monitoringStationId}`
  }

  return '/manage'
}

module.exports = {
  go
}
