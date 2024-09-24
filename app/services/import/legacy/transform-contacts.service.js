'use strict'

/**
 * Transforms NALD contact data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformContactsService
 */

const FetchContactsService = require('./fetch-contacts.service.js')
const ContactPresenter = require('../../../presenters/import/legacy/contact.presenter.js')
const CompanyContactPresenter = require('../../../presenters/import/legacy/company-contact.presenter.js')
const ImportContactValidator = require('../../../validators/import/contact.validator.js')

/**
 * Transforms NALD contact data into a validated object that matches the WRLS structure
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 * @param {object[]} transformedCompanies
 *
 */
async function go (regionCode, licenceId, transformedCompanies) {
  const naldContacts = await FetchContactsService.go(regionCode, licenceId)

  naldContacts.forEach((naldContact) => {
    const matchingCompany = _matchingCompany(transformedCompanies, naldContact)

    const transformedContact = ContactPresenter.go(naldContact)

    ImportContactValidator.go(transformedContact)

    matchingCompany.contact = { ...transformedContact, dataSource: 'nald' }

    matchingCompany.companyContact = CompanyContactPresenter.go(naldContact)
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
