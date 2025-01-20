'use strict'

/**
 * De Duplicates recipients for sending notifications
 * @module DeDupeRecipientsService
 */

/**
 * De Duplicates recipients for sending notifications
 *
 * When presenting or sending notification to recipients we need to remove duplicate contacts
 *
 * Deduplicates a list of recipients based on their contact hash ID, preferring certain roles if duplicates are found.
 *
 *
 * @param {object[]} recipients - The array of recipient objects to be deduplicated.
 * @returns {object[]} - A new array containing the deduplicated recipient objects, with the preferred roles chosen in case of duplicates.
 */
function go(recipients) {
  return Object.values(recipients.reduce(_removeDuplicateContactHash, {}))
}

function _removeDuplicateContactHash(acc, obj) {
  if (!acc[obj.contact_hash_id]) {
    acc[obj.contact_hash_id] = obj
  } else {
    const currentRole = obj.contact.role
    const existingRole = acc[obj.contact_hash_id].contact.role

    if (_licenceHolderAndReturnToRoles(currentRole, existingRole)) {
      acc[obj.contact_hash_id] = _handleDuplicateContactForBoth(obj)
    }
  }
  return acc
}

function _licenceHolderAndReturnToRoles(currentRole, existingRole) {
  const validRoles = ['Licence holder', 'Returns to']

  return validRoles.includes(currentRole) && validRoles.includes(existingRole)
}

function _handleDuplicateContactForBoth(obj) {
  return {
    ...obj,
    message_type: 'Letter - both',
    contact: {
      ...obj.contact,
      role: 'Licence holder'
    }
  }
}

module.exports = {
  go
}
