'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/return-logs/{id}/details' page
 *
 * @module ViewDetailsService
 */

const FetchReturnLogDetailsService = require('./fetch-return-log-details.service.js')
const DetailsPresenter = require('../../presenters/return-logs/details.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/return-logs/{id}/details' page
 *
 * @param {string} returnLogId - The UUID of the return log
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} version - The version number of the associated return submission to view (0 means 'current')
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(returnLogId, auth, version) {
  const returnLog = await FetchReturnLogDetailsService.go(returnLogId, version)

  const pageData = DetailsPresenter.go(returnLog, auth)

  return {
    activeSecondaryNav: 'details',
    ...pageData
  }
}

module.exports = {
  go
}
