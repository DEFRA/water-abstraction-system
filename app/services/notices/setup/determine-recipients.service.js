'use strict'

/**
 * Determine the recipients for notifications from the contact records
 * @module DetermineRecipientsService
 */

/**
 * Determine unique recipients for notifications from contact records.
 *
 * A user can manually enter a 'single use' contact. This is done in the UI under the manage recipient tab.
 *
 * The user can add a 'single use' recipient that is a duplicate of an existent recipient. This can be an email or address.
 *
 * This function simply assumes contacts with the same `contact_hash_id` represent the same recipient.
 * When duplicates exist, the first one is used (they should be exactly the same).
 *
 * We know that the RecipientsService adds the 'additionalRecipients' at the end of the recipient array. Therefore, we
 * will always override the 'single use' recipient.
 *
 * @param {object[]} contacts - A list of contacts (may contain duplicates)
 *
 * @returns {object[]} The list of unique recipients
 */
function go(contacts) {
  const recipientsByHash = {}

  for (const contact of contacts) {
    if (!recipientsByHash[contact.contact_hash_id]) {
      recipientsByHash[contact.contact_hash_id] = contact
    }
  }

  return Object.values(recipientsByHash)
}

module.exports = { go }
