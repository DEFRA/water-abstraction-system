'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence communications tab
 * @module ViewCommunicationsService
 */

const CommunicationsPresenter = require('../../presenters/licences/communications.presenter.js')
const FetchCommunicationsService = require('./fetch-communications.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

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

  const licence = await FetchLicenceService.go(licenceId)

  const { notifications, totalNumber } = await FetchCommunicationsService.go(licence.licenceRef, selectedPageNumber)

  const pageData = CommunicationsPresenter.go(notifications, licence)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    selectedPageNumber,
    `/system/licences/${licenceId}/communications`,
    notifications.length,
    'communications'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'communications',
    pagination,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
