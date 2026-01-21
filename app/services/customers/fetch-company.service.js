'use strict'

/**
 * Fetches the company data needed for the view 'customers/{id}/contacts'
 * @module FetchCompanyService
 */

const CompanyModel = require('../../models/company.model.js')

/**
 * Fetches the company data needed for the view 'customers/{id}/contacts'
 *
 * @param {string} companyId - The company id
 *
 * @returns {Promise<module:CompanyModel>} the data needed to populate the view customer page's
 */
async function go(companyId) {
  return _fetch(companyId)
}

async function _fetch(companyId) {
  return CompanyModel.query().findById(companyId).select(['id', 'name'])
}

module.exports = {
  go
}
