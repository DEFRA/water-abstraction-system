'use strict'

/**
 * Checks for old LicenceDocumentHeader contact objects and remaps to the new contact object format if required
 *
 * > This is temporary until the abstraction alerts query can be updated to fetch licence holders from licence version
 * > records
 *
 * Contacts held in the `metadata` field of the `LicenceDocumentHeaderModel` records are in a old format where names
 * have to be construed from multiple fields, and the address uses different field names. This function takes a contact,
 * and having confirmed it is in the old format it remaps it to the new format expected by the `NotifyAddressPresenter`.
 *
 * @param {object} contact - an object representing a contact returned from a notices recipients query
 *
 * @returns {object} The original contact if found to already be in the new format, else the old crm document header
 * (LicenceDocumentHeader) contact remapped as a new contact object
 */
function mapAsNewContact(contact) {
  if (!contact.type) {
    return contact
  }

  const name = _contactName(contact)

  return {
    name,
    address1: contact.addressLine1,
    address2: contact.addressLine2,
    address3: contact.addressLine3,
    address4: contact.addressLine4,
    address5: contact.town,
    address6: contact.county,
    postcode: contact.postcode,
    country: contact.country
  }
}

/**
 * Constructs and returns the full name of a contact based on their type and available properties.
 *
 * If the contact is of type `Person`, the function combines the `salutation`, `forename`,
 * `initials`, and `name` properties, prioritizing the `initials` over the `forename` if the
 * `initials` is provided. It filters out any falsy values and joins the remaining components
 * into a full name string. If the contact is not a person, it simply returns the `name` property.
 *
 * @param {object} contact - The contact object
 *
 * @returns {string} A string representing the full name of the contact.
 *
 * @private
 */
function _contactName(contact) {
  if (contact.type && contact.type.toLowerCase() === 'person') {
    const { salutation, forename, initials, name } = contact

    // NOTE: Prioritise the initials and use the contact forename if initials is null
    const initialsOrForename = initials || forename

    const nameComponents = [salutation, initialsOrForename, name]

    const filteredNameComponents = nameComponents.filter((item) => {
      return item
    })

    return filteredNameComponents.join(' ')
  }

  return contact.name
}

module.exports = {
  mapAsNewContact
}
