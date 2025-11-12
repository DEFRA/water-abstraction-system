'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 * @module ViewPurposesService
 */

const FetchLicencePurposesService = require('../licences/fetch-licence-purposes.service.js')
const PurposesPresenter = require('../../presenters/licences/purposes.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence purposes template
 */
async function go(licenceId) {
  const licencePurposes = await FetchLicencePurposesService.go(licenceId)

  const pageData = PurposesPresenter.go(licencePurposes)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
