'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 * @module ViewLicencePurposesService
 */

const FetchLicencePurposesService = require('../licences/fetch-licence-purposes.service.js')
const ViewLicencePurposesPresenter = require('../../presenters/licences/view-licence-purposes.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence purposes template
 */
async function go(licenceId) {
  const licencePurposes = await FetchLicencePurposesService.go(licenceId)

  const pageData = ViewLicencePurposesPresenter.go(licencePurposes)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
