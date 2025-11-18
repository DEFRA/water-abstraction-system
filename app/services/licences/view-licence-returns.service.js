'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const DetermineLicenceHasReturnVersionsService = require('./determine-licence-has-return-versions.service.js')
const FetchLicenceReturnsService = require('./fetch-licence-returns.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewLicenceReturnsPresenter = require('../../presenters/licences/view-licence-returns.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go(licenceId, auth, page) {
  const hasRequirements = await DetermineLicenceHasReturnVersionsService.go(licenceId)

  const { returns, licence, pagination } = await FetchLicenceReturnsService.go(licenceId, page)
  const pageData = ViewLicenceReturnsPresenter.go(returns, hasRequirements, licence)

  const paginationData = PaginatorPresenter.go(pagination.total, Number(page), `/system/licences/${licenceId}/returns`)

  return {
    ...pageData,
    activeTab: 'returns',
    pagination: paginationData,
    roles: _roles(auth)
  }
}

function _roles(auth) {
  return auth.credentials.roles.map((role) => {
    return role.role
  })
}

module.exports = {
  go
}
