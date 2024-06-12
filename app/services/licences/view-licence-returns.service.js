'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const FetchLicenceReturnsService = require('./fetch-licence-returns.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ReturnVersionModel = require('../../models/return-version.model.js')
const ViewLicenceReturnsPresenter = require('../../presenters/licences/view-licence-returns.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 * @param {Object} page - The current page for the pagination service
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth, page) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const returnsData = await FetchLicenceReturnsService.go(licenceId, page)
  const pageData = ViewLicenceReturnsPresenter.go(returnsData)

  const hasRequirements = await _licenceHasRequirements(licenceId)

  const pagination = PaginatorPresenter.go(returnsData.pagination.total, Number(page), `/system/licences/${licenceId}/returns`)

  return {
    ...pageData,
    ...commonData,
    hasRequirements,
    pagination
  }
}

async function _licenceHasRequirements (licenceId) {
  const requirement = await ReturnVersionModel.query()
    .select([
      'id'
    ])
    .where('licenceId', licenceId)
    .first()
    .limit(1)

  return !!requirement
}

module.exports = {
  go
}
