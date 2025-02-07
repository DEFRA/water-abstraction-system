'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirm-received` page
 * @module ConfirmReceivedService
 */

const FetchConfirmReceivedService = require('../../../services/return-logs/setup/fetch-confirm-received.service.js')
const ConfirmReceivedPresenter = require('../../../presenters/return-logs/setup/confirm-received.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirm-received` page
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(returnLogId) {
  const returnLog = await FetchConfirmReceivedService.go(returnLogId)

  const formattedData = ConfirmReceivedPresenter.go(returnLog)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
