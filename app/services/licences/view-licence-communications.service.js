'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence communications tab
 * @module ViewLicenceCommunicationsService
 */

const CommunicationsPresenter = require('../../presenters/licences/communications.presenter.js')
const FetchCommunicationsService = require('./fetch-communications.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence communications page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence communication template.
 */
async function go (licenceId, auth, page) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const communications = await FetchCommunicationsService.go(commonData.licenceRef, page)
  const communicationsData = CommunicationsPresenter.go(communications.communications)

  const pagination = PaginatorPresenter.go(communications.pagination.total, Number(page), `/system/licences/${licenceId}/communications`)

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
