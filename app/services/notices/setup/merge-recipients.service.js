'use strict'

/**
 * Orchestrates merging the fetched recipients with additional ones added, then filtering the results by those selected
 * @module MergeRecipientsService
 */

/**
 * Orchestrates merging the fetched recipients with additional ones added, then filtering the results by those selected
 *
 * @param {module:SessionModel} session - The session instance containing the additional recipients and those selected
 * @param {object[]} fetchedRecipients - The recipients returned from the DB
 *
 * @returns {object[]} all recipients from both groups, filtered by those selected
 */
function go(session, fetchedRecipients) {
  const { selectedRecipients } = session
  const allRecipients = _additionalRecipients(session, fetchedRecipients)

  // TODO: When we first hit the /check page `selectedRecipients` is not initialised. It calls FetchRecipientsService
  // first, which means it will eventually hit this function without `selectedRecipients` being set.
  // This only happens once, after that in the '/check page it initialises `selectedRecipients` so from there on we'll
  // never hit this clause. We reckon we can simplify this process when we have the time!
  if (!selectedRecipients) {
    return allRecipients
  }

  return _selectedRecipients(selectedRecipients, allRecipients)
}

function _additionalRecipients(session, fetchedRecipients) {
  const { additionalRecipients } = session
  const allRecipients = [...fetchedRecipients]

  if (additionalRecipients) {
    for (const additionalRecipient of additionalRecipients) {
      const matchesExisting = allRecipients.some((recipient) => {
        return recipient.contact_hash_id === additionalRecipient.contact_hash_id
      })

      // This recipient already exists. For example, a user has added an additional recipient not realising that they
      // are already included. So, we skip adding them again.
      //
      // Note, the hashes are generated just from lowercased contact information. They won't detect matches between
      // 'ACME Ltd' and 'ACME Limited', or 'J Smith' and 'Mr J Smith'.
      if (matchesExisting) {
        continue
      }

      // NOTE: If we have additional recipients it means we're doing an ad-hoc notice, so we're just looking at a single
      // licence. This means the due return logs against each fetched recipient is the same, so we can copy them all onto
      // our additional recipients. We need them, so they can be recorded in the DB and used to link the notification to
      // the correct return logs.
      additionalRecipient.return_log_ids = fetchedRecipients[0].return_log_ids

      allRecipients.push(additionalRecipient)
    }
  }

  return allRecipients
}

function _selectedRecipients(selectedRecipients, allRecipients) {
  return allRecipients.filter((recipient) => {
    return selectedRecipients.includes(recipient.contact_hash_id)
  })
}

module.exports = {
  go
}
