'use strict'

/**
 * Create an additional recipient from an address stored in session
 * @module CreateAdditionalRecipientService
 */

const crypto = require('crypto')

const SessionModel = require('../../../models/session.model.js')

/**
 * Create an additional recipient from an address stored in session
 *
 * When adding an additional recipient to a notice we need it to be in the same format as those returned from the databse.
 * This service takes an address stored in the session from the address journey and creates an additional recipient object,
 * then adds it to the additional recipients array if it exists or creates it if it doesn't.
 *
 * @param {string} sessionId
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const _additionalRecipient = {
    contact: {
      name: session.contactName,
      addressLine1: session.address.addressLine1,
      addressLine2: session.address.addressLine2,
      addressLine3: session.address.addressLine3,
      addressLine4: session.address.addressLine4,
      country: session.address.country,
      postcode: session.address.postcode
    },
    contact_hash_id: _createMD5Hash(session),
    licence_ref: session.licenceRef
  }

  if (Array.isArray(session.additionalRecipients)) {
    session.additionalRecipients.push(_additionalRecipient)
  } else {
    session.additionalRecipients = [_additionalRecipient]
  }

  session.selectedRecipients.push(_additionalRecipient.contact_hash_id)

  delete session.contactName
  delete session.contactType
  delete session.address.addressLine1
  delete session.address.addressLine2
  delete session.address.addressLine3
  delete session.address.addressLine4
  delete session.address.postcode
  delete session.address.country

  await session.$update()
}

/**
 * When querying the database on the select recipients page we return an md5 hash for each recipient which enables use to
 * check for duplicates and remove them. In this function we do the same for the recipient being added manually.
 *
 * As there is only one name field in this journey we don't have the salutation or title so this may result in duplicates
 * but they will be noticable on the screen to the user and they can adjust as needed.
 *
 * @param {object} session
 *
 * @returns {Promise<string>} - The md5 hash string of the address
 */
function _createMD5Hash(session) {
  const name = session.contactName
  const addressLine1 = session.address.addressLine1
  const addressLine2 = session.address.addressLine2 ?? ''
  const addressLine3 = session.address.addressLine3 ?? ''
  const addressLine4 = session.address.addressLine4
  const postcode = session.address.postcode ?? ''
  const country = session.address.country ?? ''

  const _combinedString = `${name}${addressLine1}${addressLine2}${addressLine3}${addressLine4}${postcode}${country}`

  return crypto.createHash('md5').update(_combinedString).digest('hex')
}

module.exports = {
  go
}
