'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/remove' page
 *
 * @module ViewRemoveCompanyContactService
 */

const FetchAbstractionAlertLicencesDal = require('../../dal/company-contacts/fetch-abstraction-alert-licences.dal.js')
const FetchCompanyContactDal = require('../../dal/company-contacts/fetch-company-contact.dal.js')
const FetchCompanyService = require('../../dal/companies/fetch-company.dal.js')
const RemoveCompanyContactPresenter = require('../../presenters/company-contacts/remove-company-contact.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/remove' page
 *
 * @param {string} id - the UUID of the company contact
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id) {
  const companyContact = await FetchCompanyContactDal.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const licences = await FetchAbstractionAlertLicencesDal.go(companyContact.abstractionAlertLicences)

  const pageData = RemoveCompanyContactPresenter.go(company, companyContact, licences)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
