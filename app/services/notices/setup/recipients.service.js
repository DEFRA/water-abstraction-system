'use strict'

/**
 * Orchestrates fetching and determining recipients
 * @module RecipientsService
 */

const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')
const FetchLetterRecipientsService = require('./fetch-letter-recipients.service.js')

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
  let recipientsData = await _recipientsData(session)

  recipientsData = _additionalRecipients(recipientsData, session)

  if (allRecipients || !session.selectedRecipients) {
    return DetermineRecipientsService.go(recipientsData)
  }

  const selectedRecipientsData = _selectedRecipients(session.selectedRecipients, recipientsData)

  return DetermineRecipientsService.go(selectedRecipientsData)
}

function _additionalRecipients(recipientsData, session) {
  if (session.additionalRecipients) {
    return [...recipientsData, ...session.additionalRecipients]
  }

  return recipientsData
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

function _selectedRecipients(selectedRecipients, recipientsData) {
  return recipientsData.filter((recipient) => {
    return selectedRecipients.includes(recipient.contact_hash_id)
  })
}

module.exports = {
  go
}
