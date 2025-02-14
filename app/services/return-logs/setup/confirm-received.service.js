'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirm-received` page
 * @module ConfirmReceivedService
 */

const ConfirmReceivedPresenter = require('../../../presenters/return-logs/setup/confirm-received.presenter.js')
const FetchReturnLogService = require('../../../services/return-logs/setup/fetch-return-log.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirm-received` page
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(returnLogId) {
  const returnLog = await FetchReturnLogService.go(returnLogId)

  const formattedData = ConfirmReceivedPresenter.go(returnLog)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
