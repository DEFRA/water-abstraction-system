'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 * @module FetchHistoryService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceVersionModel>} the licence versions
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceVersionModel.query()
    .where('licenceId', licenceId)
    .select(['endDate', 'id', 'startDate'])
    .modify('history')
}

module.exports = {
  go
}
