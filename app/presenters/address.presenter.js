'use strict'

const { postcodeValidator } = require('postcode-validator')

const { invalidStartCharacters } = require('../validators/helpers/notify-address-line.validator.js')

const MAX_ADDRESS_LINES = 6 // The Notify max is actually 7 but we reserve address line 1 for the contact name
const UK_COUNTRIES = ['england', 'northern ireland', 'scotland', 'wales', 'united kingdom']
const CROWN_DEPENDENCIES = ['guernsey', 'isle of man', 'jersey']

/**
 *
 *
 * @param {object} contact - the contact to determine the address for
 *
 * @returns {string[]} - An array of address lines
 */
function address(contact) {
  const addressParts = _addresses(contact)

  if (international(contact)) {
    return internationalAddressParts(contact, addressParts)
  }

  return ukAddressParts(contact, addressParts)
}

function _addresses(contact) {
  return [
    contact.addressLine1,
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
function international(contact) {
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
 * Determines if a contact address is invalid
 *
 * An address is considered invalid if:
 *
 * - It is a UK or Crown Dependent address without a valid postcode.
 * - It lacks both a valid postcode and a country (international addresses do not require a postcode).
 * - any of its lines start with a special character: `@ ( ) = [ ] ” \ / , < >`.
 *
 * If the address is invalid, we return the address in full (filtered for nulls) along with a message that indicates
 * it is invalid. We return the address in full so users can see everything we do have for the contact for reference.
 *
 * @private
 */
function invalidAddressParts(contact) {
  const country = contact.country ? contact.country.toLowerCase() : null
  const postcode = contact.postcode

  const noCountry = !country || UK_COUNTRIES.includes(country) || CROWN_DEPENDENCIES.includes(country)
  const noPostcode = !postcode || !postcodeValidator(postcode, 'GB')
  const hasSpecialChars = _specialCharacters(contact)

  // If address has either a valid postcode or country _and_ no special characters return an empty array. This tells
  // `go()` above to continue processing the address for sending to Notify. Else the address is invalid and `go()` will
  // simply return it.
  if ((!noCountry || !noPostcode) && !hasSpecialChars) {
    return []
  }

  // We want to tailor the address depending on why its invalid. In this case special characters trumps no country
  // and postcode
  let message = 'INVALID ADDRESS - Needs a valid postcode or country outside the UK'
  if (hasSpecialChars) {
    message = 'INVALID ADDRESS - A line starts with special character'
  }

  return [
    message,
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
 * Determines the address parts for an international contact
 *
 * International addresses are any address that is not in the UK or Crown Dependencies. For Notify to know the letter
 * is for a country outside the UK, `country` _must_ be the last line of the address lines we send to Notify.
 *
 * @private
 */
function internationalAddressParts(contact, defaultAddressParts) {
  const addressParts = [...defaultAddressParts, contact.country]

  if (addressParts.length > MAX_ADDRESS_LINES) {
    return _condense(addressParts)
  }

  return addressParts
}

/**
 * Determines the address parts for a UK contact
 *
 * UK addresses will have a valid UK postcode. They may also have country specified. If the country is in the UK we do
 * not include it in the address parts. It is superfluous and dropping it increases the chances we can avoid having to
 * condense the address.
 *
 * But because there is no validation in NALD, there is a chance that it might be holding something else entirely
 * which does have value, for example the town. Or it could be one of the Crown dependent countries in which users will
 * expect to see this reflected in the address.
 *
 * So, this function handles ensuring the country, if populated, is placed _before_ the postcode to ensure postcode is
 * the last line of the address lines we send to Notify.
 *
 * @private
 */
function ukAddressParts(contact, defaultAddressParts) {
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

function _specialCharacters(contact) {
  const lines = [
    contact.addressLine1,
    contact.addressLine2,
    contact.addressLine3,
    contact.addressLine4,
    contact.town,
    contact.county,
    contact.postcode,
    contact.country
  ]

  return lines.some((line) => {
    // If the line is not null, test it for an invalid start character
    return line ? invalidStartCharacters(line) : false
  })
}

module.exports = {
  address,
  international,
  invalidAddressParts
}
