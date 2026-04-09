'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @module ExistingAccountService
 */

const ExistingAccountPresenter = require('../../../presenters/billing-accounts/setup/existing-account.presenter.js')
const FetchExistingCompaniesService = require('./fetch-existing-companies.service.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)
  const companySearchResults = await FetchExistingCompaniesService.go(session.searchInput)

  const pageData = ExistingAccountPresenter.go(session, companySearchResults)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
