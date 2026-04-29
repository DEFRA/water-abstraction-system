'use strict'

/**
 * Formats data for the '/companies/{id}/contacts' page
 * @module ContactsPresenter
 */

const { formatContact } = require('../crm.presenter.js')

/**
 * Formats data for the '/companies/{id}/contacts' page
 *
 * @param {module:CompanyModel} company - The company
 * @param {object[]} contacts - the contacts for the company
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, contacts) {
  return {
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    links: _links(company),
    pageTitle: 'Contacts',
    pageTitleCaption: company.name,
    contacts: _contacts(contacts, company)
  }
}

function _contacts(contacts, company) {
  return contacts.map((contact) => {
    return formatContact(contact, {
      'company-id': company.id
    })
  })
}

function _links(company) {
  return {
    createContact: `/system/company-contacts/setup/${company.id}`
  }
}

module.exports = {
  go
}
