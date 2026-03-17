'use strict'

const { roles } = require('../lib/static-lookups.lib.js')

const CONTACT_ADDRESS_FIELDS = [
  'addressLine1',
  'addressLine2',
  'addressLine3',
  'addressLine4',
  'town',
  'county',
  'postcode',
  'country'
]

const ROLES = ['Licence holder', 'Returns to', 'Licence contact']

/**
 * Extracts and returns the address components from a contact object.
 *
 * This function maps over the `CONTACT_ADDRESS_FIELDS` array, using each field to
 * extract the corresponding value from the `contact` object. It then filters out
 * any falsy values (e.g., `undefined`, `null`, or empty strings) from the resulting
 * array, returning only the valid/ required address components.
 *
 * @param {object} contact - The contact object from which to extract address components.
 *
 * @returns {string[]}} An array of non-falsy address values extracted from the contact object.
 */
function contactAddress(contact) {
  return CONTACT_ADDRESS_FIELDS.map((contactAddressField) => {
    return contact[contactAddressField]
  }).filter(Boolean)
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
 */
function contactName(contact) {
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

/**
 * Extracts specific details (address, role, and name) for a list of contacts.
 *
 * This function maps over the provided `contacts` array and for each contact,
 * it extracts the `address`, `role`, and `name` using helper functions (`contactAddress`,
 * `contactName`) and includes the `role` directly.
 *
 * @param {object[]} contacts - The list of contacts
 *
 * @returns {object[]} A new array where each object contains the contact's `address`,
 * `role`, and `name`.
 */
function contactDetails(contacts) {
  return contacts.map((contact) => {
    return {
      address: contactAddress(contact),
      role: contact.role,
      name: contactName(contact)
    }
  })
}

function _contactLink(contact, billingQueryArgs) {
  const billingTypes = ['billing']
  const companyContactTypes = ['abstraction-alerts', 'additional-contact']
  const userTypes = ['basic-user', 'primary-user', 'returns-user']

  if (billingTypes.includes(contact.contactType)) {
    return `/system/billing-accounts/${contact.id}?${billingQueryArgs}`
  }

  if (companyContactTypes.includes(contact.contactType)) {
    return `/system/company-contacts/${contact.id}`
  }

  if (userTypes.includes(contact.contactType)) {
    return `/system/users/external/${contact.id}`
  }

  return `/system/companies/${contact.id}/${contact.contactType}`
}

/**
 * Filters a list of contacts based on their role and returns their details.
 *
 * ```javascript
 * // Filtered roles
 * const ROLES = ['Licence holder', 'Returns to', 'Licence contact']
 * ```
 *
 * This function filters the `contacts` array, keeping only the contacts whose `role`
 * is included in the `ROLES` array. Theses contacts are then formatted.
 *
 * @param {object[]} contacts - The list of contact objects to be filtered.
 *
 * @returns {object[]} The filtered and formatted contacts
 */
function filteredContactDetailsByRole(contacts) {
  const filteredContactDetails = contacts.filter((contact) => {
    return ROLES.includes(contact.role)
  })

  return contactDetails(filteredContactDetails)
}

/**
 * Format the contact for the contacts table
 *
 * @param {object} contact - the contact from the crm data
 * @param {string} billingQueryArgs - the query args for billing accounts
 *
 *
 * @returns {object} The formatted contact
 */
function formatContact(contact, billingQueryArgs) {
  return {
    link: _contactLink(contact, billingQueryArgs),
    name: contact.contactName,
    type: roles[contact.contactType].label
  }
}

module.exports = {
  contactAddress,
  contactDetails,
  contactName,
  filteredContactDetailsByRole,
  formatContact
}
