'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const FetchLicenceReturnsService = require('./fetch-licence-returns.service')
const ViewLicenceService = require('./view-licence.service')
const ViewLicenceReturnsPresenter = require('../../presenters/licences/view-licence-returns.presenter')
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

  const returnsData = await FetchLicenceReturnsService.go(licenceId, page)
  const pageData = ViewLicenceReturnsPresenter.go(returnsData)

  const pagination = PaginatorPresenter.go(returnsData.pagination.total, Number(page), '')

  return {
    ...pageData,
    ...commonData,
    pagination
  }
}

module.exports = {
  go
}
