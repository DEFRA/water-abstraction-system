'use strict'

/**
 * Dedupes the recipients fetched when sending notifications
 * @module DedupeRecipientsService
 */

/**
 * Dedupes the recipients fetched when sending notifications
 *
 * The recipients we fetch using `FetchRecipientsService` will contain _all_ entries. For example, if a licence has both
 * a 'Licence holder' and 'Returns to' contact the service will fetch both.
 *
 * But in a number of cases, the contact entries, once you cater for 'case' (lower and upper), are duplicated. Left as
 * is it means certain users will receive two letters, or two emails, on the same day regarding the same thing.
 *
 * Not very professional!
 *
 * The query `FetchRecipientsService` uses generates a hash ID for each contact entry. This service dedupes the entries
 * based on this hash ID to avoid us spamming our users.
 *
 * Where we have a duplicate, we favour either the licence holder or primary user entry (depending on method type) just
 * to be on the safe side, as it is the licence holder we are obligated to notify when sending comms.
 *
 * @param {object[]} recipients - The array of recipient objects to be deduplicated.
 *
 * @returns {object[]} - A new array containing the deduplicated recipient objects, with the preferred roles chosen in
 * case of duplicates.
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

/**
 * Merges two recipient objects (the accumulator object `acc` and a given `obj`), combining licenses and determining the appropriate message type.
 *
 * This function compares two recipients based on their contact hash ID. The contact details (such as name, address, etc.) might have minor differences (e.g., case sensitivity),
 * but these differences are not important since a later parser step will standardize the contact values.
 *
 * The function performs two main actions:
 * - Merges all licenses from the current recipient and the new recipient into a single CSV string,
 * removing duplicates using a Set (e.g., when both a "Licence holder" and a "Returns to" share the same license).
 * - Determines the appropriate message type based on the roles of the current and new contacts.
 *
 * @param {object} acc - The accumulator object, representing the previous state of the recipient.
 * @param {object} obj - The new recipient object to compare against the accumulator.
 * @returns {object} The updated recipient object with merged licenses and a determined message type.
 *
 * @private
 */
function _duplicateLicenceHolderAndReturnsToContact(acc, obj) {
  return {
    ...acc[obj.contact_hash_id],
    all_licences: [
      ...new Set([...acc[obj.contact_hash_id].all_licences.split(','), ...obj.all_licences.split(',')])
    ].join(','),
    message_type: _messageType(acc, obj)
  }
}

/**
 * Determines the appropriate message type based on the contact roles.
 * There are three possible message types:
 *
 * - **Letter - licence holder**: Used when both the current contact and the new contact have the role of "Licence holder".
 * - **Letter - returns to**: Used when both the current contact and the new contact have the role of "Returns to".
 * - **Letter - both**: Used when the roles do not match, indicating that both the Licence holder and Returns to will receive the same letter.
 *   This deduplication ensures the recipient only gets one letter even if both roles are involved.
 *
 * Note:
 * If this function is called after an earlier round of calculation, the accumulator's state might already have the message type set to "Letter - both".
 * In this case, the roles will never match in subsequent rounds, and the message type will always default to "Letter - both".
 * Additionally, once the message type is set to "Letter - both", the licenses will continue to accumulate in the accumulator, regardless of further role checks.
 *
 * @param {object} acc - The accumulator object containing the previous state (recipient).
 * @param {object} obj - The new object (recipient) to compare with the accumulator.
 * @returns {string} The determined message type based on the role comparison.
 *
 * @private
 */
function _messageType(acc, obj) {
  const currentRole = acc[obj.contact_hash_id].contact.role
  const newRole = obj.contact.role

  if (currentRole === 'Licence holder' && newRole === 'Licence holder') {
    return 'Letter - licence holder'
  } else if (currentRole === 'Returns to' && newRole === 'Returns to') {
    return 'Letter - returns to'
  } else {
    return 'Letter - both'
  }
}

function _duplicatePrimaryUserAndReturnsToContact(acc, obj) {
  const recipient = [acc[obj.contact_hash_id], obj].find((rec) => rec.message_type === 'Email - primary user')
  return {
    ...recipient,
    all_licences: [
      ...new Set([...acc[obj.contact_hash_id].all_licences.split(','), ...obj.all_licences.split(',')])
    ].join(','),
    message_type: 'Email - both'
  }
}

module.exports = {
  go
}
