'use strict'

/**
 * Fetches the company contacts data needed for the view 'customers/{id}/contacts'
 * @module FetchCompanyContactsService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the company contacts data needed for the view 'customers/{id}/contacts'
 *
 * @param {string} customerId - The customer id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the company contacts for the customer and the pagination object
 */
async function go(customerId, page) {
  const { results, total } = await _fetch(customerId, page)

  return { companyContacts: results, pagination: { total } }
}

async function _fetch(customerId, page) {
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
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
