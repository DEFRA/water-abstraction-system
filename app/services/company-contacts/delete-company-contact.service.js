'use strict'

/**
 * Deletes the company contact
 * @module DeleteCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

/**
 * Deletes the company contact
 *
 * A company contact can be deleted if it has not been notified.
 *
 * If a company contact has been notified, the company contact will not be deleted, it will be
 * 'soft-deleted'.
 *
 * @param {string} id - The id of the company contact
 * @param {object} notified - true if the company contacts have been notified
 */
async function go(id, notified) {
  if (notified) {
    await CompanyContactModel.query().update({ deletedAt: timestampForPostgres() }).where('id', id)
  } else {
    await CompanyContactModel.query().deleteById(id)
  }
}

module.exports = {
  go
}
