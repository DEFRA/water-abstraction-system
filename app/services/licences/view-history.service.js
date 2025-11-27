'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 * @module ViewHistoryService
 */

const FetchHistoryService = require('./fetch-history.service.js')
const HistoryPresenter = require('../../presenters/licences/history.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence history template.
 */
async function go(licenceId) {
  const licence = await FetchHistoryService.go(licenceId)

  const pageData = HistoryPresenter.go(licence)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
