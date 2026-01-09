'use strict'

/**
 * Fetches the company contacts data needed for the view 'customers/{id}/contacts'
 * @module FetchCompanyContactsService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')

/**
 * Fetches the company contacts data needed for the view 'customers/{id}/contacts'
 *
 * @param {string} customerId - The customer id for the company
 *
 * @returns {Promise<module:CompanyContactModel>} the data needed to populate the view contacts page's
 */
async function go(customerId) {
  return _fetch(customerId)
}

async function _fetch(customerId) {
  return CompanyContactModel.query()
    .select(['id'])
    .where('companyId', customerId)
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
