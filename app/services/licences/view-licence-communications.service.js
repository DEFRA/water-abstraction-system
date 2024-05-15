'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence communications tab
 * @module ViewLicenceCommunicationsService
 */

const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence communications page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence communication template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  return {
    activeTab: 'communications',
    ...commonData,
    communications: []
  }
}

module.exports = {
  go
}
