'use strict'

/**
 * Transforms NALD company data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformCompaniesService
 */

const FetchCompanyService = require('./fetch-company.service.js')
const PartiesPresenter = require('../../../presenters/import/legacy/companies.presenster.js')

/**
 * Transforms NALD company data into a validated object that matches the WRLS structure
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<object>} an object representing a valid WRLS company
 */
async function go (regionCode, licenceId) {
  const companies = await FetchCompanyService.go(regionCode, licenceId)

  const data = PartiesPresenter.go(companies)

  return {
    transformedCompanies: data,
    companies // to be used by the company address et al. services when built
  }
}

module.exports = {
  go
}
