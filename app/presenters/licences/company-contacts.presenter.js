'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 * @module CompanyContactsPresenter
 */

const { companyContact } = require('../customer.presenter.js')

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 *
 * @param {object[]} companyContactsData - The results from `FetchCompanyContactsService` to be formatted for the view
 * template
 *
 * @returns {object} The data formatted for the view template
 */
function go(companyContactsData) {
  return {
    companyContacts: _companyContacts(companyContactsData)
  }
}

function _companyContacts(companyContacts) {
  return companyContacts.map((_companyContactData) => {
    return companyContact(_companyContactData)
  })
}

module.exports = {
  go
}
