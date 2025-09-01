'use strict'

/**
 * Orchestrates merging the recipients with additional and selected recipients
 * @module AllRecipientsService
 */

/**
 * Orchestrates merging the recipients with additional and selected recipients
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object[]} recipientsData
 * @param {boolean} allRecipients - flag to decide if all recipients are required
 *
 * @returns {object[]} - recipients
 */
function go(session, recipientsData, allRecipients = true) {
  const recipients = _additionalRecipients(recipientsData, session)

  if (allRecipients || !session.selectedRecipients) {
    return recipients
  }

  return _selectedRecipients(session.selectedRecipients, recipients)
}

function _additionalRecipients(recipientsData, session) {
  if (session.additionalRecipients) {
    return [...recipientsData, ...session.additionalRecipients]
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
