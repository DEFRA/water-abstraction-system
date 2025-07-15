'use strict'

/**
 * Formats a licence document header metadata contact record into a valid Notify address
 * @module NotifyAddressPresenter
 */

const { postcodeValidator } = require('postcode-validator')

const { contactName } = require('../../../presenters/crm.presenter.js')

const MAX_ADDRESS_LINES = 6 // The Notify max is actually 7 but we reserve address line 1 for the contact name
const UK_COUNTRIES = ['england', 'northern ireland', 'scotland', 'wales']
const CROWN_DEPENDENCIES = ['guernsey', 'isle of man', 'jersey']

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
 * - An address can have a maximum of 7 lines (not stated but a known limit)
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
 * - We have lost of addresses where neither postcode nor country are populated
 * - There are some addresses where `addressLine1` is a duplicate of the contact name, which results in duplicated lines
 * - Most addresses have one or more empty address fields
 * - Lots of addresses have their address information in the wrong fields, for example, county is in country
 *
 * If an address is invalid there is nothing we can do to fix it. But we at least try to highlight it in the UI to the
 * user. An address is invalid if
 *
 * - it is a UK or Crown Dependent address without a postcode
 * - it is an address without a postcode or country (international addresses don't require a postcode)
 *
 * An attempt to send letters using this addresses will be rejected by Notify.
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

  let addressParts = _invalidAddressParts(contact)

  if (addressParts) {
    return _address(name, addressParts)
  }

  const international = _international(contact)

  addressParts = _defaultAddressParts(name, contact)

  if (international) {
    addressParts = _internationalAddressParts(contact, addressParts)
  } else {
    addressParts = _ukAddressParts(contact, addressParts)
  }

  return _address(name, addressParts)
}

/**
 * Creates a Notify address lines object from a contact name and the determined address parts
 *
 * @private
 */
function _address(name, addressParts) {
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
 * Condenses the address parts to fit within the Notify address line constraints
 *
 * This function takes an array of address parts and condenses them by combining middle elements to reduce the total
 * number of address lines. This is necessary when the address has more parts than the allowed number for Notify.
 *
 * - If there are 7 address parts, it combines the two middle-most elements.
 * - If there are 8 address parts, it combines the two pairs of middle-most elements.
 *
 * We preserve the first and last address parts are these are more likely to hold information critical to getting the
 * letter delivered successfully.
 *
 * @private
 */

function _condense(addressParts) {
  const len = addressParts.length

  const first = addressParts[0]
  const last = addressParts[len - 1]
  const middle = addressParts.slice(1, -1)

  const reducedMiddle = []

  if (len === 8) {
    // We remove 2 items by combining the 2 middle-most pairs
    reducedMiddle.push(middle[0]) // keep first
    reducedMiddle.push(`${middle[1]}, ${middle[2]}`) // combine next two
    reducedMiddle.push(`${middle[3]}, ${middle[4]}`) // combine next two
    reducedMiddle.push(middle[5]) // keep last
  } else {
    // We remove 1 item by combining the 2 middle-most elements
    reducedMiddle.push(...middle.slice(0, 2)) // keep first two
    reducedMiddle.push(`${middle[2]}, ${middle[3]}`) // combine middle two
    reducedMiddle.push(...middle.slice(4)) // keep rest
  }

  return [first, ...reducedMiddle, last]
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

  return [
    addressLine1,
    contact.addressLine2,
    contact.addressLine3,
    contact.addressLine4,
    contact.town,
    contact.county,
    contact.postcode
  ].filter(Boolean)
}

/**
 * Checks if a contact address is international
 *
 * An address is considered international if its country is not in the UK or Crown Dependencies. We use this flag
 * to determine which of our address parts functions we should use to generate the address.
 *
 * @private
 */
function _international(contact) {
  if (!contact.country) {
    return false
  }

  const country = contact.country.toLowerCase()

  if (UK_COUNTRIES.includes(country)) {
    return false
  }

  return !CROWN_DEPENDENCIES.includes(country)
}

/**
 * Determines the address parts for an international contact
 *
 * International addresses are any address that is not in the UK or Crown Dependencies. For Notify to know the letter
 * is for a country outside the UK, `country` _must_ be the last line of the address lines we send to Notify.
 *
 * @private
 */
function _internationalAddressParts(contact, defaultAddressParts) {
  const addressParts = [...defaultAddressParts, contact.country]

  if (addressParts.length > MAX_ADDRESS_LINES) {
    return _condense(addressParts)
  }

  return addressParts
}

/**
 * Determines if a contact address is invalid
 *
 * An address is considered invalid if:
 *
 * - It is a UK or Crown Dependent address without a valid postcode.
 * - It lacks both a valid postcode and a country (international addresses do not require a postcode).
 *
 * If the address is invalid, we return the address in full (filtered for nulls) along with a message that indicates
 * it is invalid. We return the address in full so users can see everything we do have for the contact for reference.
 *
 * @private
 */
function _invalidAddressParts(contact) {
  const country = contact.country ? contact.country.toLowerCase() : null
  const postcode = contact.postcode

  const noCountry = !country || UK_COUNTRIES.includes(country) || CROWN_DEPENDENCIES.includes(country)
  const noPostcode = !postcode || !postcodeValidator(postcode, 'GB')

  if (!noCountry || !noPostcode) {
    return
  }

  return [
    'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
    contact.addressLine1,
    contact.addressLine2,
    contact.addressLine3,
    contact.addressLine4,
    contact.town,
    contact.county,
    contact.postcode,
    contact.country
  ].filter(Boolean)
}

/**
 * Determines the address parts for a UK contact
 *
 * UK addresses will have a valid UK postcode. They may also have country specified. If the country is in the UK we
 * do no include it in the address parts. It is superfluous and dropping it increases the changes we can avoid having to
 * condense the address.
 *
 * But because there is no validation in NALD, there is a chance that it might be holding a something else entirely
 * which does have value, for example the town. Or it could be one of the Crown dependent countries in which users will
 * expect to see this reflected in the address.
 *
 * So, this function handles ensuring the country, if populated, is placed _before_ the postcode to ensure postcode is
 * the last line of the address lines we send to Notify.
 *
 * @private
 */
function _ukAddressParts(contact, defaultAddressParts) {
  const addressParts = [...defaultAddressParts]

  const country = contact.country ? contact.country.toLowerCase() : null

  if (country && !UK_COUNTRIES.includes(country)) {
    addressParts[addressParts.length - 1] = contact.country
    addressParts.push(contact.postcode)
  }

  if (addressParts.length > MAX_ADDRESS_LINES) {
    return _condense(addressParts)
  }

  return addressParts
}

module.exports = {
  go
}
