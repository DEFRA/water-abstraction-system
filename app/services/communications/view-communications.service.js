'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view communications page
 * @module ViewCommunicationsService
 */

const FetchCommunicationsService = require('../communications/fetch-communications.service.js')
const ViewCommunicationsPresenter = require('../../presenters/communications/view-communications.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view communications page
 *
 * @param {string} id - The ID of the communication to view
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view communications template.
 */
async function go(id) {
  const communication = await FetchCommunicationsService.go(id)

  const pageData = ViewCommunicationsPresenter.go(communication)
  console.log('🚀🚀🚀 ~ pageData:', pageData)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
