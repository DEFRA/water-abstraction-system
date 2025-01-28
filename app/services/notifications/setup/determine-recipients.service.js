'use strict'

/**
 * Dedupes the recipients fetched when sending notifications
 * @module DetermineRecipientsService
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

function _duplicateLicenceHolderAndReturnsToContact(acc, obj) {
  const recipient = [acc[obj.contact_hash_id], obj].find((rec) => rec.contact_type === 'Licence holder')
  return {
    ...recipient,
    message: 'Letter - both'
  }
}

function _duplicatePrimaryUserAndReturnsToContact(acc, obj) {
  const recipient = [acc[obj.contact_hash_id], obj].find((rec) => rec.contact_type === 'Primary user')
  return {
    ...recipient,
    message: 'Email - both'
  }
}

module.exports = {
  go
}
