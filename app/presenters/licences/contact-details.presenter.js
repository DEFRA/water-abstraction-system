'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 * @module ContactDetailsPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const { roles } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 *
 * @param {object[]} contacts - The results from `FetchContactsService` to be formatted for the view
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} The data formatted for the view template
 */
function go(contacts, licence) {
  const { id: licenceId, licenceRef } = licence

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    contacts: _contacts(contacts, licenceId),
    pageTitle: 'Contact details',
    pageTitleCaption: `Licence ${licenceRef}`,
    customerContactLink: _customerContactLink(contacts)
  }
}

/**
 * The ids returned from the query are unique to the contact type.
 *
 * We use the type to determine the correct link for the contact.
 *
 * @private
 */
function _contactLink(contact, licenceId) {
  const billingTypes = ['billing']
  const companyContactTypes = ['abstraction-alerts', 'additional-contact']
  const userTypes = ['basic-user', 'primary-user', 'returns-user']

  if (billingTypes.includes(contact.contactType)) {
    return `/system/billing-accounts/${contact.id}?licence-id=${licenceId}`
  }

  if (companyContactTypes.includes(contact.contactType)) {
    return FeatureFlagsConfig.enableCustomerManage
      ? `/system/company-contacts/${contact.id}`
      : `/customer/${licenceId}/contacts/${contact.id}`
  }

  if (userTypes.includes(contact.contactType)) {
    return `/system/users/external/${contact.id}`
  }

  return `/system/companies/${contact.id}/${contact.contactType}`
}

function _contacts(contacts, licenceId) {
  return contacts.map((contact) => {
    return {
      link: _contactLink(contact, licenceId),
      name: contact.contactName,
      type: roles[contact.contactType].label
    }
  })
}

function _customerContactLink(contacts) {
  const companyId = _findCompanyId(contacts)

  if (!companyId) {
    return null
  }

  return FeatureFlagsConfig.enableCustomerView
    ? `/system/companies/${companyId}/contacts`
    : `/customer/${companyId}/#contacts`
}

function _findCompanyId(contacts) {
  const customerContact = contacts.find((contact) => {
    return contact.contactType === 'licence-holder'
  })

  if (customerContact) {
    return customerContact.id
  }

  return null
}

module.exports = {
  go
}
