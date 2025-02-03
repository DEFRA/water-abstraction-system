'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view return log page
 * @module ViewReturnLogService
 */

const FetchReturnLogService = require('./fetch-return-log.service.js')
const ViewReturnLogPresenter = require('../../presenters/return-logs/view-return-log.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view return log page
 *
 * @param {string} returnId - The ID of the return log to view
 * @param {number} version - The version number of the associated return submission to view (0 means 'current')
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view return log template.
 */
async function go(returnId, version, auth, yar) {
  const returnLog = await FetchReturnLogService.go(returnId, version)

  const [bannerMessage] = yar.flash('banner')

  const pageData = ViewReturnLogPresenter.go(returnLog, auth)

  return {
    activeNavBar: 'search',
    bannerMessage,
    ...pageData
  }
}

module.exports = {
  go
}
