'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/licences' page
 *
 * @module LicencesService
 */

const LicencesPresenter = require('../../presenters/customers/licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/licences' page
 *
 * @param {string} _licenceId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(_licenceId) {
  const pageData = LicencesPresenter.go()

  return {
    activeTab: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
