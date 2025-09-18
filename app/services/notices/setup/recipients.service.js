'use strict'

/**
 * Orchestrates merging the recipients with additional and selected recipients
 * @module RecipientsService
 */

/**
 * Orchestrates merging the recipients with additional and selected recipients
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object[]} recipientsData
 *
 * @returns {object[]} - recipients
 */
function go(session, recipientsData) {
  const recipients = _additionalRecipients(recipientsData, session)

  if (!session.selectedRecipients) {
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
