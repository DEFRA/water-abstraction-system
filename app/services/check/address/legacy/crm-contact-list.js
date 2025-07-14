'use strict'

// Import models
const {
  Contact,
  CONTACT_ROLE_AGENT,
  CONTACT_ROLE_RETURNS_AGENT,
  CONTACT_TYPE_ORGANISATION,
  CONTACT_TYPE_PERSON,
  CONTACT_ROLE_LICENCE_HOLDER,
  CONTACT_ROLE_RETURNS_TO,
  CONTACT_ROLE_PRIMARY_USER
} = require('./contact.js')

/**
 * Creates a contacts instance given a CRM contact from document header
 *
 * @param {object} contact - from CRM contacts
 *
 * @returns {object}
 */
function createContact(contact) {
  return new Contact({
    role: _mapRole(contact.role),
    type: _mapType(contact),
    email: contact.email,
    ..._mapEntity(contact),
    ..._mapAddress(contact)
  })
}

/**
 * Creates a contacts object given CRM contact data for a document
 * @param {object} data - from CRM contacts
 *
 * @returns {ContactList}
 */
function createContacts(data) {
  return data.map((contact) => {
    return createContact(contact)
  })
}

function _mapAddress(contact) {
  return {
    addressLine1: contact.address_1,
    addressLine2: contact.address_2,
    addressLine3: contact.address_3,
    addressLine4: contact.address_4,
    town: contact.town,
    county: contact.county,
    postcode: contact.postcode,
    country: contact.country
  }
}

function _mapEntity(contact) {
  return {
    initials: contact.initials,
    salutation: contact.salutation,
    firstName: contact.forename,
    name: contact.name
  }
}

function _mapRole(role) {
  const roles = {
    licence_holder: CONTACT_ROLE_LICENCE_HOLDER,
    returns_to: CONTACT_ROLE_RETURNS_TO,
    primary_user: CONTACT_ROLE_PRIMARY_USER,
    user: CONTACT_ROLE_AGENT,
    user_returns: CONTACT_ROLE_RETURNS_AGENT
  }

  return roles[role]
}

function _mapType(contact) {
  // Service user
  if (contact.entity_id) {
    return contact.role === 'company' ? CONTACT_TYPE_ORGANISATION : CONTACT_TYPE_PERSON
  }
  // NALD company
  if ((contact.initials && contact.forename && contact.salutation) === null) {
    return CONTACT_TYPE_ORGANISATION
  }
  // NALD person
  return CONTACT_TYPE_PERSON
}

module.exports = {
  createContact,
  createContacts
}
