'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewPresenter
 */

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param recipients
 * @returns {object} - The data formatted for the view template
 */
function go(recipients) {
  const dedupeRecipients = _dedupeContactHashId(recipients)

  return {
    pageTitle: 'Send returns invitations',
    recipientsAmount: dedupeRecipients.length,
    recipients: _recipients(dedupeRecipients)
  }
}

/**
 * Deduplicates a list of recipients based on their contact hash ID, preferring certain roles if duplicates are found.
 *
 * The function iterates over an array of recipient objects and removes duplicates based on the `contact_hash_id`.
 * When duplicates are found, the function prefers the role of the recipient based on a predefined role priority order:
 *
 * 1. Primary user
 * 2. Licence holder
 * 3. Returns to
 *
 * @param {Object[]} recipients - The array of recipient objects to be deduplicated.
 * @returns {Object[]} - A new array containing the deduplicated recipient objects, with the preferred roles chosen in case of duplicates.
 *
 * @private
 */
function _dedupeContactHashId(recipients) {
  return Object.values(
    recipients.reduce((acc, obj) => {
      // If the contact is not present then add
      if (!acc[obj.contact_hash_id]) {
        acc[obj.contact_hash_id] = obj
      } else {
        // If the contact is already in the array then prefer the roles in order below
        const rolePreference = ['Primary user', 'Licence holder', 'Returns to']
        const existingRoleIndex = rolePreference.indexOf(acc[obj.contact_hash_id].contact.role)
        const newRoleIndex = rolePreference.indexOf(obj.contact.role)

        if (newRoleIndex !== -1 && (existingRoleIndex === -1 || newRoleIndex < existingRoleIndex)) {
          acc[obj.contact_hash_id] = obj
        }
      }
      return acc
    }, {})
  )
}

function _recipients(recipients) {
  return recipients.map((recipient) => {
    return {
      contact: _contact(recipient),
      licences: _licences(recipient.all_licences),
      method: recipient.message_type
    }
  })
}

/**
 * Convert the licence CSV string to an array
 *
 * @param {string} licences
 * @returns {string[]}
 */
function _licences(licences) {
  return licences.split(',')
}

/**
 * Contact can be an email or an address (letter)
 *
 * If it is an address then we convert the contact json object to an array removing any null fields
 *
 * If it is an email we return the email in array for the UI to have consistent formatting
 *
 * @param {object} recipient
 *
 * @returns {string[]}
 */
function _contact(recipient) {
  if (recipient.recipient) {
    return [recipient.recipient]
  } else {
    return Object.values(recipient.contact).filter((n) => n)
  }
}

module.exports = {
  go
}
