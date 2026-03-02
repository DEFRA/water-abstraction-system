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
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} the company contacts for the company and the pagination object
 */
async function go(companyId, page = 1) {
  const { results: companyContacts, total: totalNumber } = await _fetch(companyId, page)

  return { companyContacts, totalNumber }
}

async function _fetch(companyId, page) {
  return CompanyContactModel.query()
    .select(['id', 'abstractionAlerts'])
    .where('companyId', companyId)
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
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
