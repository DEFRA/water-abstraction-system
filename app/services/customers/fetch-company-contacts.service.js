'use strict'

/**
 * Fetches the company contacts data needed for the view 'customers/{id}/contacts'
 * @module FetchCompanyContactsService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const DatabaseConfig = require('../../../config/database.config.js')
const { db } = require('../../../db/db.js')

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
    .select(['companyContacts.id', 'abstractionAlerts'])
    .innerJoin('licenceDocumentRoles AS ldr', 'ldr.company_id', '=', 'companyContacts.companyId')
    .where('companyContacts.companyId', customerId)
    .andWhere((builder) => {
      builder.whereNull('ldr.end_date').orWhere('ldr.end_date', '>', db.raw('NOW()'))
    })
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
    .distinctOn('companyContacts.id')
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
