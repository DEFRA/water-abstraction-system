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
 * All upstream services require all the recipients, apart from the 'adhoc' journey.
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

/**
 * When the user has entered a licence, they are on the 'adhoc' journey.
 *
 * This journey allows users to select recipients from the list to send notices to.
 *
 * When we render the select recipient page, we need to display all the recipients for the use.
 *
 * Otherwise, we need only the selected recipients.
 *
 * @private
 */
async function _adHoc(session, allRecipients) {
  if (allRecipients) {
    return await FetchRecipientsService.go(session)
  } else {
    const recipientsData = await FetchRecipientsService.go(session)

    if (session.selectedRecipients) {
      return _selectedRecipients(session.selectedRecipients, recipientsData)
    }

    return recipientsData
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
