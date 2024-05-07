'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceBillsService
 */

const FetchLicenceBillsService = require('./fetch-licence-bills.service')
const ViewLicenceService = require('./view-licence.service')
const ViewLicenceBillsPresenter = require('../../presenters/licences/view-licence-bills.presenter')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const billsData = await FetchLicenceBillsService.go(licenceId, 1)
  const pageData = ViewLicenceBillsPresenter.go(billsData.bills)

  return {
    ...commonData,
    ...pageData,
    pagination: { total: 1 }
  }
}

module.exports = {
  go
}
