'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/licence-set-up` page
 * @module FetchLicenceSetUpService
 */

/**
 * Fetch the matching licence and return data needed for the view licence set up page
 *
 * Was built to provide the data needed for the '/licences/{id}/licence-set-up' page
 *
 * @param {string} licenceId The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's set up tab
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceRef) {
  return []
}

module.exports = {
  go
}
