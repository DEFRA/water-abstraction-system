'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceBillsService
 */

const FetchLicenceBillsService = require('./fetch-licence-bills.service')
const ViewLicenceBillsPresenter = require('../../presenters/licences/view-licence-bills.presenter')
const ViewLicenceService = require('./view-licence.service')
const PaginatorPresenter = require('../../presenters/paginator.presenter')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth, page) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const billsData = await FetchLicenceBillsService.go(licenceId, page)
  const pageData = ViewLicenceBillsPresenter.go(billsData.bills)

  const pagination = PaginatorPresenter.go(billsData.pagination.total, Number(page), `/system/licences/${licenceId}/bills`)

  return {
    ...commonData,
    ...pageData,
    pagination
  }
}

module.exports = {
  go
}
