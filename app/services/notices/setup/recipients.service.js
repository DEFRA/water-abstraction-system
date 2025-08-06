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
 * @param {module:SessionModel} session - The session instance
 * @param {boolean} allRecipients - flag to decide if all recipients are required
 *
 * @returns {Promise<object[]>} - recipients
 */
async function go(session, allRecipients = true) {
  let recipientsData

  if (session.journey === 'alerts') {
    recipientsData = await FetchAbstractionAlertRecipientsService.go(session)
  } else {
    recipientsData = await FetchRecipientsService.go(session)
  }

  if (session.additionalRecipients) {
    recipientsData = [...recipientsData, ...session.additionalRecipients]
  }

  if (session.additionalRecipient && session.addressVisited) {
    recipientsData = [...recipientsData, session.additionalRecipient]
  }

  if (allRecipients || !session.selectedRecipients) {
    return DetermineRecipientsService.go(recipientsData)
  }

  const selectedRecipientsData = _selectedRecipients(session.selectedRecipients, recipientsData)

  return DetermineRecipientsService.go(selectedRecipientsData)
}

async function _additionalRecipients(recipientsData, session) {
  let recipients = recipientsData

  // We need any previous additional recipients
  if (session.additionalRecipients) {
    recipients = [...recipients, ...session.additionalRecipients]
  }

  // This is purley for deduping on the select recipient page
  // If an additional recipient has been selected and the address page has been visisted
  if (session.additionalRecipient && session.addressVisited) {
    recipients = [...recipients, session.additionalRecipient]
  }

  return recipients
}

function _selectedRecipients(selectedRecipients, recipientsData) {
  return recipientsData.filter((recipient) => {
    return selectedRecipients.includes(recipient.contact_hash_id)
  })
}

module.exports = {
  go
}
