'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence returns page
 * @module ViewReturnsService
 */

const DetermineLicenceHasReturnVersionsService = require('./determine-licence-has-return-versions.service.js')
const FetchReturnsService = require('./fetch-returns.service.js')
const FetchLicenceService = require('../../services/licences/fetch-licence.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ReturnsPresenter = require('../../presenters/licences/returns.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

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
  const licence = await FetchLicenceService.go(licenceId)

  const hasRequirements = await DetermineLicenceHasReturnVersionsService.go(licenceId)

  const { returns, pagination } = await FetchReturnsService.go(licenceId, page)

  const pageData = ReturnsPresenter.go(returns, hasRequirements, licence)

  const paginationData = PaginatorPresenter.go(
    pagination.total,
    Number(page),
    `/system/licences/${licenceId}/returns`,
    returns.length,
    'returns'
  )

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'returns',
    pagination: paginationData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
