'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 * @module FetchCommunicationsService
 */

/**
 * Fetch the matching licence and return data needed for the view licence communications page
 *
 * Was built to provide the data needed for the '/licences/{id}/communications' page
 *
 * @param {string} licenceId The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's communications tab
 */
async function go (licenceId, page) {
  const { results, total } = await _fetch(licenceId, page)

  return { communications: results, pagination: { total } }
}

async function _fetch (licenceId, page) {
  return { results: [], total: 0 }
}

module.exports = {
  go
}
