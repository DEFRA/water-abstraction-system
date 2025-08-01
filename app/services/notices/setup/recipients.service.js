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
 * Most upstream services require only fetching and
 *
 * @param {module:SessionModel} session - The session instance
 * @param {boolean} allRecipients - flag to decide if all recipients are required
 *
 * @returns {Promise<object[]>} - recipients
 */
async function go(session, allRecipients = false) {
  let recipientsData

  if (session.journey === 'alerts') {
    recipientsData = await FetchAbstractionAlertRecipientsService.go(session)
  } else if (session.journey === 'adhoc') {
    recipientsData = await _adHoc(session, allRecipients)
  } else {
    recipientsData = await FetchRecipientsService.go(session)
  }

  return DetermineRecipientsService.go(recipientsData)
}

async function _adHoc(session, allRecipients) {
  const recipientsData = await FetchRecipientsService.go(session)

  if (!allRecipients && session.selectedRecipients) {
    return _selectedRecipients(session.selectedRecipients, recipientsData)
  }

  return recipientsData
}

function _selectedRecipients(selectedRecipients, recipientsData) {
  return recipientsData.filter((recipient) => {
    return selectedRecipients.includes(recipient.contact_hash_id)
  })
}

module.exports = {
  go
}
