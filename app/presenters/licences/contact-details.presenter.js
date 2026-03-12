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
 * @param {object[]} licenceContacts - The results from `FetchContactsService` to be formatted for the view
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} The data formatted for the view template
 */
function go(licenceContacts, licence) {
  const { licenceRef } = licence

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    licenceContacts: _licenceContacts(licenceContacts),
    pageTitle: 'Contact details',
    pageTitleCaption: `Licence ${licenceRef}`,
    customerContactLink: _customerContactLink(licenceContacts)
  }
}

function _customerContactLink(licenceContacts) {
  const companyId = _findCompanyId(licenceContacts)

  if (!companyId) {
    return null
  }

  return FeatureFlagsConfig.enableCustomerView
    ? `/system/companies/${companyId}/contacts`
    : `/customer/${companyId}/#contacts`
}

function _findCompanyId(licenceContacts) {
  const customerContact = licenceContacts.find((contact) => {
    return contact.contactType === 'licence-holder'
  })

  if (customerContact) {
    return customerContact.id
  }

  return null
}

function _licenceContacts(licenceContacts) {
  return licenceContacts.map((licenceContact) => {
    return {
      contactType: roles[licenceContact.contactType].label,
      name: licenceContact.contactName
    }
  })
}

module.exports = {
  go
}
