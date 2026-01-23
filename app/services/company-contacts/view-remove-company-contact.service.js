'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/remove' page
 *
 * @module ViewRemoveCompanyContactService
 */

const DetermineRemainingAbstractionAlertsService = require('./determine-remaining-abstraction-alerts.service.js')
const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const FetchCompanyService = require('../companies/fetch-company.service.js')
const RemoveCompanyContactPresenter = require('../../presenters/company-contacts/remove-company-contact.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/remove' page
 *
 * @param {string} id - the UUID of the company contact
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id) {
  const companyContact = await FetchCompanyContactService.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const abstractionAlertsCount = await DetermineRemainingAbstractionAlertsService.go(companyContact.companyId)

  const pageData = RemoveCompanyContactPresenter.go(company, companyContact, abstractionAlertsCount)

  return {
    ...pageData,
    activeNavBar: 'search'
  }
}

module.exports = {
  go
}
