'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence communications tab
 * @module ViewLicenceCommunicationsService
 */

const ViewLicenceService = require('./view-licence.service.js')
const FetchCommunicationsService = require('./fetch-communications.service.js')
const CommunicationsPresenter = require('../../presenters/licences/communications.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence communications page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence communication template.
 */
async function go (licenceId, auth, page) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const communications = await FetchCommunicationsService.go(licenceId, page)
  const communicationsData = CommunicationsPresenter.go(communications.communications)

  return {
    activeTab: 'communications',
    ...commonData,
    ...communicationsData
  }
}

module.exports = {
  go
}
