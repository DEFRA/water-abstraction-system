'use strict'

/**
 * Fetches all customer contacts for a licence which is needed for the view '/licences/{id}/contact-details` page
 * @module FetchCustomerContactsService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')

/**
 * Fetches all customer contacts for a licence which is needed for the view '/licences/{id}/contact-details` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<object[]>} the data needed to populate the view licence page's contact details tab
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return CompanyContactModel.query()
    .select(['companyContacts.id', 'abstractionAlerts'])
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
    .innerJoin('licenceDocumentRoles AS ldr', 'ldr.company_id', '=', 'companyContacts.companyId')
    .innerJoin('licenceDocuments AS ld', 'ld.id', '=', 'ldr.licenceDocumentId')
    .innerJoin('licences AS l', 'l.licenceRef', '=', 'ld.licenceRef')
    .where('l.id', licenceId)
}

module.exports = {
  go
}
