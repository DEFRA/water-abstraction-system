'use strict'

/**
 * Fetches all contacts for a specified company
 * @module FetchCompanyContactsService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')

/**
 * Fetches all contacts for a specified company
 *
 * @param {string} companyId - The UUID of the company to fetch contacts for
 *
 * @returns {Promise<object[]>} an object containing the matching contacts needed to populate the view
 */
async function go(companyId) {
  return CompanyContactModel.query()
    .select(['id', 'contactId'])
    .distinctOn('contactId')
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
        'department'
      ])
    })
}

module.exports = {
  go
}
