'use strict'

/**
 * Add an 'additional recipient' to the notice setup session from address data captured by our shared address journey
 * @module ProcessAddRecipientService
 */

const crypto = require('node:crypto')

const SessionModel = require('../../../models/session.model.js')
const { flashNotification } = require('../../../lib/general.lib.js')

/**
 * Add an 'additional recipient' to the notice setup session from address data captured by our shared address journey
 *
 * When adding an additional recipient to a notice we need it to be in the same format as those returned from the
 * database. This service takes an address stored in the session from the address journey and creates an additional
 * recipient object, then adds it to the additional recipients array if it exists or creates it if it doesn't.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)
  const { address } = session.addressJourney

  const additionalRecipient = {
    contact: {
      name: session.contactName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      addressLine3: address.addressLine3,
      addressLine4: address.addressLine4,
      country: address.country,
      postcode: address.postcode
    },
    contact_hash_id: _contactHashId(session),
    contact_type: 'single use',
    email: null,
    licence_ref: session.licenceRef,
    licence_refs: [session.licenceRef],
    message_type: 'Letter'
  }

  _addRecipient(session, additionalRecipient)

  session.selectedRecipients.push(additionalRecipient.contact_hash_id)

  await _resetSession(session)

  flashNotification(yar, 'Updated', 'Additional recipient added')
}

function _addRecipient(session, additionalRecipient) {
  if (session.additionalRecipients) {
    session.additionalRecipients.push(additionalRecipient)

    return
  }

  session.additionalRecipients = [additionalRecipient]
}

/**
 * When querying the database on the select recipients page we return an md5 hash for each recipient which enables use
 * to check for duplicates and remove them. In this function we do the same for the recipient being added manually.
 *
 * As there is only one name field in this journey we don't have the salutation or title so this may result in
 * duplicates but they will be noticeable on the screen to the user and they can adjust as needed.
 *
 * @private
 */
function _contactHashId(session) {
  const { address } = session.addressJourney

  const name = session.contactName
  const addressLine1 = address.addressLine1
  const addressLine2 = address.addressLine2 ?? ''
  const addressLine3 = address.addressLine3 ?? ''
  const addressLine4 = address.addressLine4
  const postcode = address.postcode ?? ''
  const country = address.country ?? ''

  const _combinedString = `${name}${addressLine1}${addressLine2}${addressLine3}${addressLine4}${postcode}${country}`

  return crypto.createHash('md5').update(_combinedString).digest('hex')
}

/**
 * Because a user can add multiple additional recipients to a notice, the generic address journey will be reused. We
 * don't want the values from one journey to appear when adding another, so we need to reset the session.
 *
 * @private
 */
async function _resetSession(session) {
  delete session.contactName
  delete session.contactType

  session.addressJourney.address = {}

  await session.$update()
}

module.exports = {
  go
}
