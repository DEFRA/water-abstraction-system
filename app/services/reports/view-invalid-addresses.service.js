'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view invalid addresses page
 * @module ViewInvalidAddressesService
 */

const FetchInvalidAddressesService = require('./fetch-invalid-addresses.service.js')
const ViewInvalidAddressesPresenter = require('../../presenters/reports/view-invalid-addresses.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view invalid addresses page
 *
 * @returns {Promise<object>} The view data for the invalid addresses page
 */
async function go() {
  const invalidAddresses = await FetchInvalidAddressesService.go()

  const pageData = ViewInvalidAddressesPresenter.go(invalidAddresses)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
