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
  const { licenceRef } = licence

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    contacts: _contacts(contacts),
    pageTitle: 'Contact details',
    pageTitleCaption: `Licence ${licenceRef}`,
    customerContactLink: _customerContactLink(contacts)
  }
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

function _contacts(contacts) {
  return contacts.map((contact) => {
    return {
      contactType: roles[contact.contactType].label,
      name: contact.contactName
    }
  })
}

module.exports = {
  go
}
