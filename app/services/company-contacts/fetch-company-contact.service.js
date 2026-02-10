'use strict'

/**
 * Fetches the company contact data needed for the view '/company-contacts/{id}' pages
 * @module FetchCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')

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
      'companyContacts.id',
      'companyContacts.abstractionAlerts',
      'companyContacts.companyId',
      'companyContacts.createdAt',
      'companyContacts.updatedAt',
      CompanyContactModel.query()
        .alias('subCompanyContacts')
        .count('subCompanyContacts.id')
        .whereColumn('subCompanyContacts.company_id', 'companyContacts.companyId')
        .where('subCompanyContacts.abstraction_alerts', true)
        .as('abstractionAlertsCount')
    ])
    .where('companyContacts.id', companyContactId)
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
    .withGraphFetched('createdByUser')
    .modifyGraph('createdByUser', (createdByUserBuilder) => {
      createdByUserBuilder.select(['id', 'username'])
    })
    .withGraphFetched('updatedByUser')
    .modifyGraph('updatedByUser', (updatedByUserBuilder) => {
      updatedByUserBuilder.select(['id', 'username'])
    })
    .first()
}

module.exports = {
  go
}
