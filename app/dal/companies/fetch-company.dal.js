/**
 * Fetches the company data needed for the view '/companies/{id}/contacts'
 * @module FetchCompanyDal
 */

import CompanyModel from '../../models/company.model.js'

/**
 * Fetches the company data needed for the view '/companies/{id}/contacts'
 *
 * @param {string} companyId - The company id
 *
 * @returns {Promise<module:CompanyModel>} the data needed to populate the view customer page's
 */
export default async function fetchCompany(companyId) {
  return _fetch(companyId)
}

async function _fetch(companyId) {
  return CompanyModel.query().findById(companyId).select(['id', 'name'])
}
