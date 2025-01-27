'use strict'

/**
 * Formats contact data from crm.metadata.contacts
 * @module CRMContactPresenter
 */

const roles = ['Licence holder', 'Returns to', 'Licence contact']

const contactAddressFields = [
  'addressLine1',
  'addressLine2',
  'addressLine3',
  'addressLine4',
  'town',
  'county',
  'postcode',
  'country'
]

/**
 * Processes an array of contacts and returns a list of objects containing the contact's address, role, and name.
 *
 * This contacts come directly from the **licenceDocumentHeader.metadata.contacts** object.
 *
 * The function first filters the contacts to include only those with valid roles.
 * Then, for each valid contact, it extracts the address, role, and name.
 *
 * @param {Array<Object>} contacts - An array of contact objects, each containing various fields including role, address, and name.
 * @param {string} contacts[].role - The role of the contact (e.g., 'Licence holder', 'Returns to').
 * @param {Object} contacts[].address - The address details of the contact (used by `_contactAddress`).
 * @param {string} contacts[].name - The name of the contact (used by `_contactName`).
 *
 * @returns {Array<Object>} - A new array of objects, each containing the contact's address, role, and name.
 *
 * @example
 * const contacts = [
 *   { role: 'Licence holder', name: 'John Doe', address: { street: '123 Main St', city: 'Springfield' } },
 *   { role: 'Returns to', name: 'Jane Smith', address: { street: '456 Elm St', city: 'Springfield' } }
 * ];
 * const result = go(contacts);
 *
 * // Output:
 * // [
 * //   { address: { street: '123 Main St', city: 'Springfield' }, role: 'Licence holder', name: 'John Doe' },
 * //   { address: { street: '456 Elm St', city: 'Springfield' }, role: 'Returns to', name: 'Jane Smith' }
 * // ]
 *
 * @private
 */
function go(contacts) {
  const filteredContacts = _extractOnlyContactsWithRoles(contacts)

  return filteredContacts.map((contact) => {
    return {
      address: _contactAddress(contact),
      role: contact.role,
      name: _contactName(contact)
    }
  })
}

function _extractOnlyContactsWithRoles(contacts) {
  return contacts.filter((contact) => {
    return roles.includes(contact.role)
  })
}

/**
 * Extracts the address fields from a contact object and returns them as an array,
 * omitting any falsy values (e.g., empty strings, null, undefined).
 *
 * This function maps over a predefined set of address fields in the `contact` object,
 * retrieves their values, and filters out any falsy values that may exist in the address
 * data (e.g., missing or empty fields).
 *
 * @param {Object} contact - The contact object containing address-related fields.
 * @param {string} contact.addressLine1 - The first line of the contact's address.
 * @param {string} contact.addressLine2 - The second line of the contact's address.
 * @param {string} contact.addressLine3 - The third line of the contact's address (optional).
 * @param {string} contact.addressLine4 - The fourth line of the contact's address (optional).
 * @param {string} contact.town - The town or city of the contact's address.
 * @param {string} contact.county - The county or region of the contact's address.
 * @param {string} contact.postcode - The postcode of the contact's address.
 * @param {string} contact.country - The country of the contact's address.
 *
 * @returns {Array<string>} An array of address fields from the contact, with falsy values removed.
 * Each element in the array corresponds to a non-falsy value from the contact's address fields.
 *
 * @example
 * const contact = {
 *   addressLine1: '123 Main St',
 *   addressLine2: '',
 *   addressLine3: 'Apt 4B',
 *   addressLine4: null,
 *   town: 'Springfield',
 *   county: 'Greene',
 *   postcode: '12345',
 *   country: 'USA'
 * };
 * const address = _contactAddress(contact);
 * // Output: ['123 Main St', 'Apt 4B', 'Springfield', 'Greene', '12345', 'USA']
 *
 * @private
 */
function _contactAddress(contact) {
  return contactAddressFields.map((field) => contact[field]).filter(Boolean)
}

/**
 * Constructs a full name for a contact based on their type.
 *
 * If the contact is a "Person", the function will prioritize using the initials
 * (if available). If not, it will use the forename. The salutation, initials or forename,
 * and last name will be concatenated together to form the full name. Any falsy values
 * (such as empty strings or `null`) are removed from the final result.
 *
 * If the contact is not a "Person", the function simply returns the `name` property.
 *
 * @param {Object} contact - The contact object containing information about the person.
 * @param {string} contact.type - The type of the contact (e.g., "Person").
 * @param {string} contact.salutation - The salutation (e.g., "Mr.", "Dr.").
 * @param {string} contact.forename - The forename (e.g., "John").
 * @param {string} contact.initials - The initials (e.g., "J.D.").
 * @param {string} contact.name - The full name of the contact (e.g., "Doe").
 * @returns {string} The full name of the contact, or the contact's `name` if not a "Person".
 *
 * @example
 * const contact = {
 *   type: 'Person',
 *   salutation: 'Dr.',
 *   forename: 'John',
 *   initials: 'J.D.',
 *   name: 'Doe'
 * };
 * // Output: 'Dr. J.D. Doe'
 *
 * @private
 */
function _contactName(contact) {
  if (contact.type === 'Person') {
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
  go
}
