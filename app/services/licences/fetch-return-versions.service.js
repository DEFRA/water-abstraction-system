/**
 * Fetches return requirements data needed for the view '/licences/{id}/set-up` page
 * @module FetchReturnVersionsService
 */

import ReturnVersionModel from '../../models/return-version.model.js'

/**
 * Fetches return requirements data needed for the view '/licences/{id}/set-up` page
 *
 * @param {string} licenceId - The licence id for the licence to fetch return requirements
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's set up tab
 */
export default async function fetchReturnVersionsService(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return ReturnVersionModel.query()
    .select(['id', 'startDate', 'endDate', 'status', 'reason'])
    .where('licenceId', licenceId)
    .whereNot('status', 'draft')
    .orderBy([
      { column: 'startDate', order: 'desc' },
      { column: 'version', order: 'desc' }
    ])
    .withGraphFetched('modLogs')
    .modifyGraph('modLogs', (builder) => {
      builder.select(['id', 'reasonDescription']).orderBy('externalId', 'asc')
    })
}
