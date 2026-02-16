'use strict'

/**
 * Fetches the company contacts data needed for the '/company-contacts/setup/{sessionId}/check' page
 * @module FetchCompanyContactsService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')

/**
 * Fetches the company contacts data needed for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} companyId - The company id for the company
 *
 * @returns {Promise<object>} the company contacts for the company and the pagination object
 */
async function go(companyId) {
  return _fetch(companyId)
}

async function _fetch(companyId) {
  return CompanyContactModel.query()
    .select(['companyContacts.id'])
    .where('companyContacts.companyId', companyId)
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
}

module.exports = {
  go
}
