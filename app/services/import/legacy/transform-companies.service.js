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
 * @returns {Promise<object>} an object representing a valid WRLS company
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
    transformedCompanies: _removeDuplicateCompanies(transformedCompanies),
    companies
  }
}

/**
 * Remove duplicate companies from the transformed array
 *
 * We need to get the address and party id for each company.
 *
 * But some of these companies will share the same party id. We can remove these duplicates
 * and only persist the company once.
 *
 * @param {object[]} transformedCompanies - The transformed companies
 *
 * @param transformedCompanies
 * @returns {object[]} -The transformed companies array with no duplicates
 */
function _removeDuplicateCompanies (transformedCompanies) {
  return transformedCompanies.reduce((accumulator, currentValue) => {
    if (!accumulator.some((obj) => { return obj.externalId === currentValue.externalId })) {
      accumulator.push(currentValue)
    }

    return accumulator
  }, [])
}

module.exports = {
  go
}
