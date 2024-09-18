'use strict'

/**
 * Fetches all customer contacts for a licence which is needed for the view '/licences/{id}/contact-details` page
 * @module FetchCustomerContactsService
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches all customer contacts for a licence which is needed for the view '/licences/{id}/contact-details` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's contact details tab
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return db.withSchema('public')
    .select([
      'con.contact_type',
      'con.data_source',
      'con.department',
      'con.email',
      'con.firstName',
      'con.initials',
      'con.lastName',
      'con.middle_initials',
      'con.salutation',
      'con.suffix',
      'lr.label AS communicationType'
    ])
    .distinct()
    .from('licenceDocuments AS ld')
    .innerJoin('licences AS l', 'l.licenceRef', '=', 'ld.licenceRef')
    .innerJoin('licenceDocumentRoles AS ldr', 'ldr.licenceDocumentId', '=', 'ld.id')
    .where('l.id', '=', licenceId)
    .andWhere((builder) => {
      builder.whereNull('ldr.end_date').orWhere('ldr.end_date', '>', db.raw('NOW()'))
    })
    .innerJoin('companyContacts AS cct', 'cct.companyId', '=', 'ldr.companyId')
    .innerJoin('contacts AS con', 'con.id', '=', 'cct.contactId')
    .innerJoin('licenceRoles AS lr', 'lr.id', '=', 'cct.licenceRoleId')
}

module.exports = {
  go
}
