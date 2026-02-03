'use strict'

/**
 * Fetches any contacts that the provided companyId has
 * @module FetchCompaniesService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')

/**
 * Fetches any contacts that the provided companyId has
 *
 * @param {string} companyId - The UUID of the company to search for
 *
 * @returns {Promise<object[]>} an object containing the matching contacts needed to populate the view
 */
async function go(companyId) {
  return CompanyContactModel.query()
    .select(['id', 'contactId'])
    .distinctOn('contactId')
    .where('companyId', companyId)
    .withGraphFetched('contact')
}

module.exports = {
  go
}
