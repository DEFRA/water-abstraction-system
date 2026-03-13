'use strict'

/**
 * Formats a licence document header metadata contact record into a valid Notify address
 * @module NotifyAddressPresenter
 */

const { contactName } = require('../../../presenters/crm.presenter.js')
const { address, invalidAddressParts } = require('../../address.presenter.js')

/**
 * Formats a licence document header metadata contact record into a valid Notify address
 *
 * When sending a letter via GOV.UK Notify it needs us to provide an address in the 'personalisation' we send.
 *
 * - `address_line_1`
 * - `address_line_2`
 * - `address_line_3`
 * - `address_line_4`
 * - `address_line_5`
 * - `address_line_6`
 * - `address_line_7`
 *
 * They also stipulate the following.
 *
 * - The address must have at least 3 lines.
 * - The last line needs to be a real UK postcode or the name of a country outside the UK.
 * - An address can have a maximum of 7 lines
 * - No address line can start with a special character: `@ ( ) = [ ] ” \ / , < >`
 *
 * Within a Notify letter template only these 7 lines are used for the address section. So, we reserve `address_line_1`
 * for the contact's name.
 *
 * When we need to send a letter, we'll use the contact details recorded in the licence document header's `metadata`
 * field (`crm.document_header`). It has been deemed more accurate than the details held in the `crm_v2` schema. Even
 * so, we are still left with problems.
 *
 * - There are 8 possible address fields for a contact but we are limited to 6
 * - Many UK addresses have the country field populated, but postcode needs to be the last line as per Notify
 * - Many non-UK addresses have the postcode field populated, but country needs to be the last line as per Notify
 * - We have lots of addresses where neither postcode nor country are populated
 * - We have some addresses with an address line that starts with special characters
 * - There are some addresses where `addressLine1` is a duplicate of the contact name, which results in duplicated lines
 * - Most addresses have one or more empty address fields
 * - Lots of addresses have their address information in the wrong fields, for example, county is in country
 *
 * If an address is invalid there is nothing we can do to fix it. But we at least try to highlight it in the UI to the
 * user. An address is invalid if
 *
 * - it is a UK or Crown Dependent address without a postcode
 * - it is an address without a postcode or country (international addresses don't require a postcode)
 * - any of its lines start with a special character
 *
 * An attempt to send letters using these addresses will be rejected by Notify.
 *
 * We can simply ignore empty address fields, as long as we are left with a valid address.
 *
 * To help with the address condensing issue, we ignore country if its in the UK. It's also not required when the
 * country is a crown dependent, but we keep it in those cases to allay concerns users may have. It does mean however
 * that the country must come _before_ postcode for these contacts.
 *
 * We identify international addresses so we can ensure the postcode, if present, goes _before_ country in the address
 * lines we send to Notify.
 *
 * After processing the address parts, if we still have 8 parts we combine the middle two pairs (3 & 4 and 5 & 6). If we
 * have 7 parts we combine 3 & 4. Typically, the middle parts of the address are not pertinent to getting a letter to
 * the correct address so combining these was deemed safest.
 *
 * > For this module we recommend viewing the unit tests to get an understanding of the scenarios the presenter is
 * > handling, and how contact addresses are transformed for Notify
 *
 * @param {object} contact - the contact to determine the Notify address for
 *
 * @returns {object} a Notify compatible address object
 */
function go(contact) {
  // Contact name will always be address_line_1 in any result we return
  const name = contactName(contact)

  const invalidAddress = invalidAddressParts(contact)

  if (invalidAddress.length !== 0) {
    return _addressLines(name, invalidAddress)
  }

  const defaultContact = _defaultAddressParts(name, contact)

  const addressParts = address(defaultContact)

  return _addressLines(name, addressParts)
}

/**
 * Creates a Notify address lines object from a contact name and the determined address parts
 *
 * @private
 */
function _addressLines(name, addressParts) {
  const fullContact = [name, ...addressParts]

  const addressLines = {}

  for (const [index, value] of fullContact.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return addressLines
}

/**
 * Checks if the contact name is the same as the addressLine1
 *
 * If yes, it returns null, else returns addressLine1. This is for contacts where a user has entered the same value for
 * the contact name and address line 1. It results in a letter with the following address.
 *
 * ```text
 * Rodger the Dodger Enterprises
 * Rodger the Dodger Enterprises
 * 10 Long Street
 * Beanotown
 * ```
 *
 * This look like an issue or error in the service so we remove the duplication. This also benefits addresses with
 * multiple address parts. Removing the duplication increases the chance we can avoid having to combine the remaining
 * address parts.
 *
 * @private
 */
function _addressLine1(name, addressLine1) {
  const parsedName = name.toLowerCase().trim()
  const parsedAddressLine1 = addressLine1 ? addressLine1.toLowerCase().trim() : ''

  if (parsedName === parsedAddressLine1) {
    return null
  }

  return addressLine1
}

/**
 * Creates the default address parts for the Notify address
 *
 * Both UK and international addresses make use of these address parts. So, we extract them from the contact here to
 * avoid some duplication in the other address parts functions.
 *
 * @private
 */
function _defaultAddressParts(name, contact) {
  const addressLine1 = _addressLine1(name, contact.addressLine1)

  return {
    ...contact,
    addressLine1
  }
}

module.exports = {
  go
}
