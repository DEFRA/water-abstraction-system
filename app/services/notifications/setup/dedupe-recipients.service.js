'use strict'

/**
 * Dedupes the recipients fetched when sending notifications
 * @module DedupeRecipientsService
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
    acc[obj.contact_hash_id] = obj.contact
      ? _duplicateLicenceHolderAndReturnsToContact(acc, obj)
      : _duplicatePrimaryUserAndReturnsToContact(acc, obj)
  }

  return acc
}

function _duplicateLicenceHolderAndReturnsToContact(acc, obj) {
  const recipient = [acc[obj.contact_hash_id], obj].find((rec) => rec.message_type === 'Letter - licence holder')
  return {
    ...recipient,
    message_type: 'Letter - both'
  }
}

function _duplicatePrimaryUserAndReturnsToContact(acc, obj) {
  const recipient = [acc[obj.contact_hash_id], obj].find((rec) => rec.message_type === 'Email - primary user')
  return {
    ...recipient,
    message_type: 'Email - both'
  }
}

module.exports = {
  go
}
