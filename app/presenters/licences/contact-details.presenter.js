'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 * @module ContactDetailsPresenter
 */

const { formatContact } = require('../crm.presenter.js')

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
    licenceHolderContactsLink: _licenceHolderContactsLink(contacts),
    pageTitle: 'Contact details',
    pageTitleCaption: `Licence ${licenceRef}`
  }
}

function _contacts(contacts, licenceId) {
  return contacts.map((contact) => {
    return formatContact(contact, {
      'licence-id': licenceId
    })
  })
}

function _findCompanyId(contacts) {
  const licenceHolderContact = contacts.find((contact) => {
    return contact.contactType === 'licence-holder'
  })

  if (licenceHolderContact) {
    return licenceHolderContact.id
  }

  return null
}

function _licenceHolderContactsLink(contacts) {
  const companyId = _findCompanyId(contacts)

  if (!companyId) {
    return null
  }

  return `/system/companies/${companyId}/contacts`
}

module.exports = {
  go
}
