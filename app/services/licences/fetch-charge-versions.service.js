/**
 * Fetches charge version data needed for the view '/licences/{id}/set-up` page
 * @module FetchChargeVersionsService
 */

import ChargeVersionModel from '../../models/charge-version.model.js'

/**
 * Fetches charge version data needed for the view '/licences/{id}/set-up` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch charge versions for
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's set up tab
 */
export default async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return ChargeVersionModel.query()
    .where('licenceId', licenceId)
    .select(['id', 'startDate', 'endDate', 'status', 'licenceId'])
    .withGraphFetched('changeReason')
    .modifyGraph('changeReason', (builder) => {
      builder.select(['description'])
    })
    .orderBy([
      { column: 'startDate', order: 'desc' },
      { column: 'versionNumber', order: 'desc' }
    ])
}
