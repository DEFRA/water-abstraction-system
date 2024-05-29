'use strict'

/**
 * Fetches return requirements data needed for the view '/licences/{id}/set-up` page
 * @module FetchReturnRequirementsService
 */

/**
 * Fetches return requirements data needed for the view '/licences/{id}/set-up` page
 *
 * @param {string} licenceRef - The licence ref for the licence to fetch return requirements
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's set up tab
 */
async function go (licenceRef) {
  return _fetch(licenceRef)
}

async function _fetch (licenceRef) {
  return []
}

module.exports = {
  go
}
