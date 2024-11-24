'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/{sessionId}/view` page
 * @module ViewService
 */

const FetchReturnVersionService = require('./fetch-return-version.service.js')
const ViewPresenter = require('../../presenters/return-versions/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/{sessionId}/view` page
 *
 * @param {string} returnVersionId - The UUID for the return version
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(returnVersionId) {
  const requirementsForReturns = await FetchReturnVersionService.go(returnVersionId)

  const data = ViewPresenter.go(requirementsForReturns)

  return {
    activeNavBar: 'search',
    ...data
  }
}

module.exports = {
  go
}
