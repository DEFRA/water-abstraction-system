'use strict'

/**
 * Fetches the company contact data needed for the view '/company-contacts/{id}' pages
 * @module FetchCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const LicenceDocumentRoleModel = require('../../models/licence-document-role.model.js')

/**
 * Fetches the company contact data needed for the view '/company-contacts/{id}' pages
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
    .select([
      'id',
      'companyId',
      'abstractionAlerts',
      // Add a subquery to get the total for the company
      CompanyContactModel.query()
        // Use countDistinct on the primary key to avoid duplicates from the join
        // .countDistinct('ccSub.id')
        .count('abstractionAlerts')
        .from('companyContacts as ccSub')
        // .innerJoin('licenceDocumentRoles AS ldr', 'ldr.company_id', 'ccSub.companyId')
        .where('ccSub.companyId', CompanyContactModel.ref('companyId'))
        // .andWhere('ccSub.abstractionAlerts', true)
        // .andWhere((builder) => {
        //   builder.whereNull('ldr.end_date').orWhere('ldr.end_date', '>', CompanyContactModel.raw('NOW()'))
        // })
        .as('abstractionAlertsCount')
    ])
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
