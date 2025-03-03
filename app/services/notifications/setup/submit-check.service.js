'use strict'

/**
 * Orchestrates handling the data for `/notifications/setup/{sessionId}/check` page
 * @module SubmitCheckService
 */

const SessionModel = require('../../../models/session.model.js')
const RecipientsService = require('./fetch-recipients.service.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')

/**
 * Orchestrates handling the data for `/notifications/setup/{sessionId}/check` page
 *
 * This service will transform the recipients into notifications and start processing notifications.
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 *
 * @returns {Promise<object>} The view data for the licence page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const recipientsData = await RecipientsService.go(session)

  const recipients = DetermineRecipientsService.go(recipientsData)

  return recipients
}

module.exports = {
  go
}
