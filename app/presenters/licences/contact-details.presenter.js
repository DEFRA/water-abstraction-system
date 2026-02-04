'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 * @module ContactDetailsPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

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

  const companyId = _findCompanyId(licenceContacts)

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    companyId,
    licenceContacts: _licenceContacts(licenceContacts),
    pageTitle: 'Contact details',
    pageTitleCaption: `Licence ${licenceRef}`,
    customerContactLink: FeatureFlagsConfig.enableCustomerView
      ? `/system/companies/${companyId}/contacts`
      : `/customer/${companyId}/#contacts`
  }
}

function _findCompanyId(licenceContacts) {
  const customerContact = licenceContacts.find((contact) => {
    return contact.communicationType === 'Licence Holder'
  })

  if (customerContact) {
    return customerContact.companyId
  }

  return null
}

function _licenceContacts(licenceContacts) {
  return licenceContacts.map((licenceContact) => {
    return {
      address: {
        address1: licenceContact.address1,
        address2: licenceContact.address2,
        address3: licenceContact.address3,
        address4: licenceContact.address4,
        address5: licenceContact.address5,
        address6: licenceContact.address6,
        country: licenceContact.country,
        postcode: licenceContact.postcode
      },
      communicationType: licenceContact.communicationType,
      name: licenceContact.companyName
    }
  })
}

module.exports = {
  go
}
