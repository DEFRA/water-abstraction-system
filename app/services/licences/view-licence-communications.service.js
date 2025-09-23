'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence communications tab
 * @module ViewLicenceCommunicationsService
 */

const FetchCommunicationsService = require('./fetch-communications.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')
const ViewLicenceCommunicationsPresenter = require('../../presenters/licences/view-licence-communications.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence communications page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number|string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence communication template.
 */
async function go(licenceId, auth, page = 1) {
  const selectedPageNumber = Number(page)

  const commonData = await ViewLicenceService.go(licenceId, auth)

  const communications = await FetchCommunicationsService.go(commonData.licenceRef, selectedPageNumber)
  const communicationsData = ViewLicenceCommunicationsPresenter.go(
    communications.communications,
    commonData.documentId,
    licenceId
  )

  const pagination = PaginatorPresenter.go(
    communications.pagination.total,
    selectedPageNumber,
    `/system/licences/${licenceId}/communications`
  )

  return {
    activeTab: 'communications',
    ...commonData,
    ...communicationsData,
    pagination
  }
}

module.exports = {
  go
}
