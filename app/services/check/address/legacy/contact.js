'use strict'

const CONTACT_TYPE_PERSON = 'Person'
const CONTACT_TYPE_ORGANISATION = 'Organisation'

const CONTACT_ROLE_LICENCE_HOLDER = 'Licence holder'
const CONTACT_ROLE_RETURNS_TO = 'Returns to'
const CONTACT_ROLE_PRIMARY_USER = 'Primary user'
const CONTACT_ROLE_AGENT = 'Agent'
const CONTACT_ROLE_RETURNS_AGENT = 'Returns agent'

class Contact {
  constructor(data = {}) {
    // Type and role
    this.type = data.type
    this.role = data.role

    // Email address
    this.email = data.email

    // Name
    this.initials = data.initials
    this.salutation = data.salutation
    this.firstName = data.firstName
    this.name = data.name

    // Address
    this.addressLine1 = data.addressLine1
    this.addressLine2 = data.addressLine2
    this.addressLine3 = data.addressLine3
    this.addressLine4 = data.addressLine4
    this.town = data.town
    this.county = data.county
    this.postcode = data.postcode
    this.country = data.country
  }

  /**
   * Gets the full name of a contact
   *
   * @returns {string}
   */
  getFullName() {
    const { type, initials, salutation, firstName, name } = this

    if (type === CONTACT_TYPE_ORGANISATION) {
      return name
    }

    const parts = [salutation, initials || firstName, name]

    return parts
      .filter((x) => {
        return x
      })
      .join(' ')
  }
}

module.exports = {
  Contact,
  CONTACT_TYPE_PERSON,
  CONTACT_TYPE_ORGANISATION,
  CONTACT_ROLE_LICENCE_HOLDER,
  CONTACT_ROLE_RETURNS_TO,
  CONTACT_ROLE_PRIMARY_USER,
  CONTACT_ROLE_AGENT,
  CONTACT_ROLE_RETURNS_AGENT
}
