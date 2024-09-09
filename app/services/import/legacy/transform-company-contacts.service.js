'use strict'

/**
 * Transforms NALD company data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformCompanyContactsService
 */

const FetchCompanyContactsService = require('./fetch-company-contacts.service.js')
const CompanyContactPresenter = require('../../../presenters/import/legacy/company-contact.presenter.js')
const ImportCompanyContactValidator = require('../../../validators/import/company-contact.validator.js')

/**
 * Transforms NALD company data into a validated object that matches the WRLS structure
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 * @param {object[]} transformedCompanies
 *
 * @returns {Promise<object>} an object representing an array of valid WRLS transformed companies and
 * an array of companies from the db
 */
async function go (regionCode, licenceId, transformedCompanies) {
  const naldContacts = await FetchCompanyContactsService.go(regionCode, licenceId)

  naldContacts.forEach((naldContact) => {
    const matchingCompany = _matchingCompany(transformedCompanies, naldContact)

    const transformedContact = CompanyContactPresenter.go(naldContact)

    ImportCompanyContactValidator.go(transformedContact)

    matchingCompany.contact = transformedContact
  })
}

function _matchingCompany (transformedCompanies, naldContact) {
  return transformedCompanies.find((company) => {
    return company.externalId === naldContact.external_id
  })
}

module.exports = {
  go
}
