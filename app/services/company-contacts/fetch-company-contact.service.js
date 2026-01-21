'use strict'

/**
 * Fetches the company contact data needed for the view '/company-contacts/{id}/manage'
 * @module FetchCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')

/**
 * Fetches the company contact data needed for the view '/company-contacts/{id}/manage'
 *
 * @param {string} companyContactId - The company contact id
 *
 * @returns {Promise<CompanyContactModel>} the company contacts for the customer and the pagination object
 */
async function go(companyContactId) {
  return _fetch(companyContactId)
}

async function _fetch(companyContactId) {
  return CompanyContactModel.query()
    .select(['id', 'companyId', 'abstractionAlerts'])
    .where('id', companyContactId)
    .withGraphFetched('contact')
    .modifyGraph('contact', (contactBuilder) => {
      contactBuilder.select([
        'id',
        'salutation',
        'firstName',
        'middleInitials',
        'lastName',
        'initials',
        'contactType',
        'suffix',
        'department',
        'email'
      ])
    })
    .first()
}

module.exports = {
  go
}
