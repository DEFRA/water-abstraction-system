'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const DetermineLicenceHasReturnVersionsService = require('./determine-licence-has-return-versions.service.js')
const FetchLicenceReturnsService = require('./fetch-licence-returns.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewLicenceReturnsPresenter = require('../../presenters/licences/view-licence-returns.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth, page) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const hasRequirements = await DetermineLicenceHasReturnVersionsService.go(licenceId)

  const returnsData = await FetchLicenceReturnsService.go(licenceId, page)
  const pageData = ViewLicenceReturnsPresenter.go(returnsData.returns, hasRequirements, auth)

  const pagination = PaginatorPresenter.go(returnsData.pagination.total, Number(page), `/system/licences/${licenceId}/returns`)

  return {
    activeTab: 'returns',
    ...pageData,
    ...commonData,
    pagination
  }
}

module.exports = {
  go
}
