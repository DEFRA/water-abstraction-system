'use strict'

/**
 * Delete a company contact by id
 * @module DeleteCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')

/**
 * Delete a company contact by id
 *
 * @param {string} companyContactId - The company contact id
 *
 * @returns {Promise<number>} the number of rows deleted
 */
async function go(companyContactId) {
  return CompanyContactModel.query().deleteById(companyContactId)
}

module.exports = {
  go
}
