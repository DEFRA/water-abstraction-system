'use strict'

/**
 * Orchestrates fetching and determining recipients
 * @module RecipientsService
 */

const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')

/**
 * Orchestrates fetching and determining recipients
 *
 * Fetches the recipients based on the journey type and determines recipients (remove duplicates).
 *
 * @param session
 *
 * @returns {Promise<object[]>} - recipients
 */
async function go(session) {
  let recipientsData

  if (session.journey === 'alerts') {
    recipientsData = await FetchAbstractionAlertRecipientsService.go(session)
  } else {
    recipientsData = await FetchRecipientsService.go(session)
  }

  return DetermineRecipientsService.go(recipientsData)
}

module.exports = {
  go
}
