'use strict'

/**
 * Fetches the contact needed for the view 'customers/{customerId}/contacts/{contactId}'
 * @module FetchContactService
 */

const ContactModel = require('../../../models/contact.model.js')
const { db } = require('../../../../db/db.js')
const CompanyContactModel = require('../../../models/company-contact.model.js')
const DatabaseConfig = require('../../../../config/database.config.js')

/**
 * Fetches the contact needed for the view 'customers/{customerId}/contacts/{contactId}'Id}'
 *
 * @param {string} contactId - The contact id for the company
 *
 * @param customerId
 * @returns {Promise<object>} the contact for the customer
 */
async function go(customerId, contactId) {
  return _fetch(customerId, contactId)
}

async function _fetch(customerId, contactId) {
  return ContactModel.query()
    .select([
      'contacts.id',
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
    .where('contacts.id', contactId)
    .first()
    .withGraphFetched('companyContacts')
    .modifyGraph('companyContacts', (companyContactsBuilder) => {
      companyContactsBuilder
        .select(['companyContacts.id', 'abstractionAlerts'])
        .innerJoin('licenceDocumentRoles AS ldr', 'ldr.company_id', '=', 'companyContacts.companyId')
        .where('companyContacts.companyId', customerId)
        .andWhere('companyContacts.contactId', contactId)
        .andWhere((builder) => {
          builder.whereNull('ldr.end_date').orWhere('ldr.end_date', '>', db.raw('NOW()'))
        })
        .distinctOn('companyContacts.id')
    })
}

module.exports = {
  go
}
