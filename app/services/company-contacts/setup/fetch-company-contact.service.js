'use strict'

/**
 * Fetches the company contact data needed for the '/company-contacts/setup/{id}/edit'
 * @module FetchCompanyContactService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')

/**
 * Fetches the company contact data needed for the '/company-contacts/setup/{id}/edit'
 *
 * @param {string} companyContactId - The company contact id
 *
 * @returns {Promise<CompanyContactModel>} the company contact
 */
async function go(companyContactId) {
  return _fetch(companyContactId)
}

async function _fetch(companyContactId) {
  return CompanyContactModel.query()
    .select(['id', 'abstractionAlerts'])
    .where('companyContacts.id', companyContactId)
    .withGraphFetched('company')
    .modifyGraph('company', (companyBuilder) => {
      companyBuilder.select(['id', 'name'])
    })
    .withGraphFetched('contact')
    .modifyGraph('contact', (contactBuilder) => {
      contactBuilder.select(['id', 'department', 'email'])
    })
    .first()
}

module.exports = {
  go
}
