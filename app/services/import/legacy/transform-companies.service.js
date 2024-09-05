'use strict'

/**
 * Transforms NALD company data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformCompaniesService
 */

const FetchCompanyService = require('./fetch-company.service.js')
const CompanyPresenter = require('../../../presenters/import/legacy/company.presenter.js')
const ImportCompanyValidator = require('../../../validators/import/company.validator.js')

/**
 * Transforms NALD company data into a validated object that matches the WRLS structure
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<object>} an object representing an array of valid WRLS transformed companies and
 * an array of companies from the db
 */
async function go (regionCode, licenceId) {
  const companies = await FetchCompanyService.go(regionCode, licenceId)

  const transformedCompanies = []

  companies.forEach((company) => {
    const transformedCompany = CompanyPresenter.go(company)

    ImportCompanyValidator.go(transformedCompany)

    transformedCompanies.push(transformedCompany)
  })

  return {
    transformedCompanies,
    companies
  }
}

module.exports = {
  go
}
