/**
 * Fetches data needed for the view '/licences/{id}/history` page
 * @module FetchHistoryService
 */

import LicenceVersionModel from '../../models/licence-version.model.js'

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceVersionModel>} the licence versions
 */
export default async function fetchHistoryService(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceVersionModel.query()
    .where('licenceId', licenceId)
    .select(['endDate', 'id', 'startDate'])
    .modify('changeType')
    .orderBy([
      { column: 'startDate', order: 'desc' },
      { column: 'issue', order: 'desc' },
      { column: 'increment', order: 'desc' }
    ])
    .modify('history')
}
