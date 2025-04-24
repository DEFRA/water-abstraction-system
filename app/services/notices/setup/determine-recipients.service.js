'use strict'

/**
 * Determine the recipients for notifications from the contact records
 * @module DetermineRecipientsService
 */

/**
 * Determine the recipients for notifications from the contact records
 *
 * As detailed `FetchContactsService`, it works out what contact records to use for each licence with a due return for
 * the selected period.
 *
 * For each it calculates a hash ID, and where it can it then merges the contacts into a single row, or 'recipient'.
 *
 * > We use 'recipient' to refer to the data we will use when generating a letter or email via GOV.UK Notify. We use
 * > 'contact' to refer to the source data we base that determination on.
 *
 * Where it can't, is where this service steps in.
 *
 * A common example is where the _exact_ same contact information as been added for both roles; 'Licence holder' and
 * 'Returns to'.
 *
 * PostgreSQL cannot group these because the `contact` objects we extract from `licence_document_header.metadata` have
 * different roles so are not _exactly_ the same. But we know from their contact hash ID the recipient is the same.
 *
 * Another example, is where the someone has used uppercase against one licence, and lowercase in another. The roles are
 * the same, as is the contact hash ID, but because the address information uses a different case, so PostgreSQL cannot
 * group them.
 *
 * This service first extracts the unique contact hash IDs from the results. It then iterates through them, looking for
 * matches. Where a single match is returned, PostgreSQL has either done the job, or the contact _is_ unique so it
 * becomes a 'recipient'.
 *
 * Where more than one match is found, the service will merge the contacts (depending on whether they are email or
 * letter based). The result of the merge becomes the 'recipient'.
 *
 * The key thing we need to determine when merging contacts is what `contact_type` to use for the merged record
 * and what the `message_type` will be (Email or Letter).
 *
 * If all the matched contacts have the same contact type, then it will be used for the merged 'recipient'. But as per
 * our first example, if the roles differ, we have to assign a new contact type: 'Email - both' for email contacts, and
 * 'Letter - both'. This is how we are able in the UI to let users know a 'recipient' has been assigned both roles, so
 * we will just send the one notification (we default to the licence holder template in these cases).
 *
 * @param {object[]} contacts - The results of `FetchContactsService`
 *
 * @returns {object[]} The list of recipients we will send notifications to
 */
function go(contacts) {
  const uniqueContactHashIds = _uniqueContactHashIds(contacts)

  const recipients = []

  for (const uniqueContactHashId of uniqueContactHashIds) {
    const recipient = _determineRecipient(uniqueContactHashId, contacts)

    recipients.push(recipient)
  }

  return recipients
}

function _determineRecipient(contactHashId, contacts) {
  const matches = contacts.filter((contact) => {
    return contact.contact_hash_id === contactHashId
  })

  return _mergeRecipients(matches)
}

function _includesContactType(matches, contactType) {
  return matches.some((match) => {
    return match.contact_type === contactType
  })
}

function _mergeRecipients(matches) {
  const { contact } = matches[0]

  if (contact) {
    return _mergeRecipientsForLetter(matches)
  }
  return _mergeRecipientsForEmail(matches)
}

function _mergeRecipientsForEmail(matches) {
  const primaryUser = _includesContactType(matches, 'Primary user')
  const returnsAgent = _includesContactType(matches, 'Returns agent')

  let contactType

  if (primaryUser && returnsAgent) {
    contactType = 'both'
  } else if (primaryUser) {
    contactType = 'Primary user'
  } else {
    contactType = 'Returns agent'
  }

  return {
    licence_refs: _mergeLicenceReferences(matches),
    contact_type: contactType,
    email: matches[0].email,
    contact: null,
    contact_hash_id: matches[0].contact_hash_id,
    message_type: 'Email'
  }
}

function _mergeRecipientsForLetter(matches) {
  const licenceHolder = _includesContactType(matches, 'Licence holder')
  const returnsTo = _includesContactType(matches, 'Returns to')

  let contactType

  if (licenceHolder && returnsTo) {
    contactType = 'both'
  } else if (licenceHolder) {
    contactType = 'Licence holder'
  } else {
    contactType = 'Returns to'
  }

  return {
    licence_refs: _mergeLicenceReferences(matches),
    contact_type: contactType,
    email: null,
    contact: matches[0].contact,
    contact_hash_id: matches[0].contact_hash_id,
    message_type: 'Letter'
  }
}

function _mergeLicenceReferences(matches) {
  const allLicenceRefs = matches.map((match) => {
    return match.licence_refs
  })

  return [...new Set(allLicenceRefs)].join(',')
}

function _uniqueContactHashIds(contacts) {
  const allContactHashIds = contacts.map((contact) => {
    return contact.contact_hash_id
  })

  return [...new Set(allContactHashIds)]
}

module.exports = {
  go
}
