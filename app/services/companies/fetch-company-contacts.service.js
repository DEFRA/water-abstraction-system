'use strict'

/**
 * Fetches the company contacts data needed for the view '/companies/{id}/contacts'
 * @module FetchCompanyContactsService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the company contacts data needed for the view '/companies/{id}/contacts'
 *
 * @param {string} companyId - The company id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the company contacts for the company and the pagination object
 */
async function go(companyId, page) {
  const { results, total } = await _fetch(companyId, page)

  return { companyContacts: results, pagination: { total } }
}

async function _fetch(companyId, page) {
  return CompanyContactModel.query()
    .select(['companyContacts.id', 'abstractionAlerts'])
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
    .withGraphFetched('licenceRole')
    .modifyGraph('licenceRole', (licenceRoleBuilder) => {
      licenceRoleBuilder.select(['label'])
    })
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
