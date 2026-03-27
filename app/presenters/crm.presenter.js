'use strict'

const { roles } = require('../lib/static-lookups.lib.js')

/**
 * Format the contact for the contacts table
 *
 * @param {object} contact - the contact from the crm data
 * @param {object} [billingQueryArgs] - the query args for billing accounts
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

function _contactLink(contact, billingQueryArgs) {
  const billingTypes = ['billing']
  const companyContactTypes = ['abstraction-alerts', 'additional-contact']
  const userTypes = ['basic-user', 'primary-user', 'returns-user']
  const queryString = new URLSearchParams(billingQueryArgs).toString()

  if (billingTypes.includes(contact.contactType)) {
    return `/system/billing-accounts/${contact.id}?${queryString}`
  }

  if (companyContactTypes.includes(contact.contactType)) {
    return `/system/company-contacts/${contact.id}/contact-details`
  }

  if (userTypes.includes(contact.contactType)) {
    return `/system/users/external/${contact.id}`
  }

  if (contact.addressId) {
    return `/system/companies/${contact.id}/address/${contact.addressId}/${contact.contactType}?${queryString}`
  }

  return `/system/companies/${contact.id}/${contact.contactType}`
}

module.exports = {
  formatContact
}
