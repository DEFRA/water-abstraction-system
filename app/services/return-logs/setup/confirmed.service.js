'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirmed` page
 * @module ConfirmedService
 */

const ConfirmedPresenter = require('../../../presenters/return-logs/setup/confirmed.presenter.js')
const FetchReturnLogService = require('../../../services/return-logs/setup/fetch-return-log.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirmed` page
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(returnLogId) {
  const returnLog = await FetchReturnLogService.go(returnLogId)

  const formattedData = ConfirmedPresenter.go(returnLog)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
