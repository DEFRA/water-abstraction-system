'use strict'

/**
 * Orchestrates fetching and determining recipients
 * @module FetchRecipientsService
 */

const DetermineRecipientsService = require('./determine-recipients.service.js')
const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchLetterRecipientsService = require('./fetch-letter-recipients.service.js')
const FetchReturnsRecipientsService = require('./fetch-returns-recipients.service.js')
const RecipientsService = require('./recipients.service.js')

/**
 * Orchestrates fetching and determining recipients
 *
 * Fetches the recipients based on the journey type and determines recipients (remove duplicates).
 *
 * @param {module:SessionModel} session - The session instance
 * @param {boolean} allRecipients - flag to decide if all recipients are required
 *
 * @returns {Promise<object[]>} - recipients
 */
async function go(session, allRecipients = true) {
  const recipientsData = await _recipientsData(session)

  const recipients = RecipientsService.go(session, recipientsData, allRecipients)

  return DetermineRecipientsService.go(recipients)
}

async function _recipientsData(session) {
  if (session.journey === 'alerts') {
    return FetchAbstractionAlertRecipientsService.go(session)
  } else if (session.noticeType === 'returnForms') {
    return FetchLetterRecipientsService.go(session)
  } else {
    return FetchReturnsRecipientsService.go(session)
  }
}

module.exports = {
  go
}
