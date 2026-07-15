/**
 * Fetches the licences and their versions, related to a company, data needed for the view '/companies/{id}/history'
 * @module FetchHistoryDal
 */

import DatabaseConfig from '../../../config/database.config.js'
import LicenceModel from '../../models/licence.model.js'

/**
 * Fetches the licences and their versions, related to a company, data needed for the view '/companies/{id}/history'
 *
 * @param {string} companyId - The company id for the company
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} the licences for the company and the pagination object
 */
export default async function fetchHistoryDal(companyId, page = '1') {
  const { results: licences, total: totalNumber } = await _fetch(companyId, page)

  return { licences, totalNumber }
}

async function _fetch(companyId, page) {
  return LicenceModel.query()
    .select(['expiredDate', 'id', 'lapsedDate', 'licenceRef', 'revokedDate', 'startDate'])
    .whereExists(LicenceModel.relatedQuery('licenceVersions').where('licenceVersions.companyId', companyId))
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
      licenceVersionsBuilder
        .select(['endDate', 'id', 'startDate'])
        .modify('changeType')
        .where('companyId', companyId)
        .orderBy([
          { column: 'startDate', order: 'desc' },
          { column: 'issue', order: 'desc' },
          { column: 'increment', order: 'desc' }
        ])
    })
    .orderBy('licenceRef', 'asc')
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}
