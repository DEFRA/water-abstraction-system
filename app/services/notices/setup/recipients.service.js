'use strict'

/**
 * Orchestrates fetching and determining recipients
 * @module RecipientsService
 */

const DetermineRecipientsService = require('./determine-recipients.service.js')
const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchLetterRecipientsService = require('./fetch-letter-recipients.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const RecipientsAddService = require('./recipients-add.service.js')

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

  const recipients = RecipientsAddService.go(session, recipientsData, allRecipients)

  return DetermineRecipientsService.go(recipients)
}

async function _recipientsData(session) {
  if (session.journey === 'alerts') {
    return FetchAbstractionAlertRecipientsService.go(session)
  } else if (session.noticeType === 'returnForms') {
    return FetchLetterRecipientsService.go(session)
  } else {
    return FetchRecipientsService.go(session)
  }
}

module.exports = {
  go
}
