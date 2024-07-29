'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/licence-contact` page
 * @module FetchLicenceContactService
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches all contact details for a licence which is needed for the view '/licences/{id}/licence-contact` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's contact details link page
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return db.withSchema('public')
    .select([
      'lr.label AS communicationType',
      'cmp.id AS companyId',
      'cmp.name AS companyName',
      'con.id AS contactId',
      'con.firstName',
      'con.lastName',
      'a.address1',
      'a.address2',
      'a.address3',
      'a.address4',
      'a.address5',
      'a.address6',
      'a.postcode',
      'a.country'
    ])
    .from('licenceDocuments AS ld')
    .innerJoin('licences AS l', 'l.licenceRef', '=', 'ld.licenceRef')
    .innerJoin('licenceDocumentRoles AS ldr', 'ldr.licenceDocumentId', '=', 'ld.id')
    .innerJoin('licenceRoles AS lr', 'lr.id', '=', 'ldr.licenceRoleId')
    .innerJoin('companies AS cmp', 'cmp.id', '=', 'ldr.companyId')
    .leftJoin('contacts AS con', 'con.id', '=', 'ldr.contactId')
    .innerJoin('addresses AS a', 'a.id', '=', 'ldr.addressId')
    .where('l.id', '=', licenceId)
    .orderBy('lr.label', 'asc')
}

module.exports = {
  go
}
