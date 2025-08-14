'use strict'

/**
 * Add an 'additional recipient' to the notice setup session from address data captured by our shared address journey
 * @module AddAdditionalRecipientService
 */

const crypto = require('crypto')

const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Add an 'additional recipient' to the notice setup session from address data captured by our shared address journey
 *
 * When adding an additional recipient to a notice we need it to be in the same format as those returned from the databse.
 * This service takes an address stored in the session from the address journey and creates an additional recipient object,
 * then adds it to the additional recipients array if it exists or creates it if it doesn't.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const additionalRecipient = {
    contact: {
      name: session.contactName,
      addressLine1: session.address.addressLine1,
      addressLine2: session.address.addressLine2,
      addressLine3: session.address.addressLine3,
      addressLine4: session.address.addressLine4,
      country: session.address.country,
      postcode: session.address.postcode
    },
    contact_hash_id: _contactHashId(session),
    licence_refs: session.licenceRef
  }

  _addAdditionalRecipient(session, additionalRecipient)

  session.selectedRecipients.push(additionalRecipient.contact_hash_id)

  await _resetGenericAddressSupport(session)

  GeneralLib.flashNotification(yar, 'Updated', 'Additional recipient added')
}

function _addAdditionalRecipient(session, additionalRecipient) {
  if (session.additionalRecipients) {
    session.additionalRecipients.push(additionalRecipient)

    return
  }

  session.additionalRecipients = [additionalRecipient]
}

/**
 * When querying the database on the select recipients page we return an md5 hash for each recipient which enables use to
 * check for duplicates and remove them. In this function we do the same for the recipient being added manually.
 *
 * As there is only one name field in this journey we don't have the salutation or title so this may result in duplicates
 * but they will be noticable on the screen to the user and they can adjust as needed.
 *
 * @private
 */
function _contactHashId(session) {
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

/**
 * Because a user can add multiple additional recipients to a notice, the generic address journey will be reused. We
 * don't want the values from one journey to appear when adding another, so we need to reset the session.
 *
 * @private
 */
async function _resetGenericAddressSupport(session) {
  delete session.contactName
  delete session.contactType

  session.address = { redirectUrl: `/system/notices/setup/${session.id}/check` }

  await session.$update()
}

module.exports = {
  go
}
