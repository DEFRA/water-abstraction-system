'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 * @module ViewService
 */

// const FetchExistingRequirementsService = require('./fetch-existing-requirements.service.js')
const FetchRequirementsForReturnsService = require('./fetch-requirements-for-returns.js')
const FetchPointsService = require('./fetch-points.service.js')
const PurposeModel = require('../../models/purpose.model.js')
const ViewPresenter = require('../../presenters/return-requirements/view.presenter.js')
// const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 *
 * @param {string} returnVersionId - The UUID for return requirement version
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (returnVersionId) {
  const requirementsForReturns = await FetchRequirementsForReturnsService.go(returnVersionId)

  const points = await FetchPointsService.go(requirementsForReturns.licence.id)

  const data = ViewPresenter.go(requirementsForReturns, points)

  return {
    activeNavBar: 'search',
    ...data
  }
}

module.exports = {
  go
}
