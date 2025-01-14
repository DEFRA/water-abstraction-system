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
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view return log template.
 */
async function go(returnId, auth) {
  const returnLog = await FetchReturnLogService.go(returnId)

  const pageData = ViewReturnLogPresenter.go(returnLog, auth)

  return {
    pageTitle: 'Abstraction return',
    ...pageData
  }
}

module.exports = {
  go
}
