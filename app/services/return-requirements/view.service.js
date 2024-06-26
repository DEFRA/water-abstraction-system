'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/view` page
 * @module ViewService
 */

const FetchRequirementsForReturnsService = require('./fetch-requirements-for-returns.service.js')
const ViewPresenter = require('../../presenters/return-requirements/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/view` page
 *
 * @param {string} returnVersionId - The UUID for return requirement version
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (returnVersionId) {
  const requirementsForReturns = await FetchRequirementsForReturnsService.go(returnVersionId)

  const data = ViewPresenter.go(requirementsForReturns)

  return {
    activeNavBar: 'search',
    ...data
  }
}

module.exports = {
  go
}
