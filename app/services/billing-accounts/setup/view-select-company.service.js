'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/billing-accounts/setup/{sessionId}/select-company' page
 *
 * @module ViewSelectCompanyService
 */

const FetchCompaniesService = require('./fetch-companies.service.js')
const SelectCompanyPresenter = require('../../../presenters/billing-accounts/setup/select-company.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the '/billing-accounts/setup/{sessionId}/select-company' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const companies = await FetchCompaniesService.go(session.companySearch)

  const pageData = SelectCompanyPresenter.go(session, companies)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
