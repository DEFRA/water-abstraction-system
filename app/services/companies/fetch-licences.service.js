'use strict'

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 * @module FetchLicencesService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 *
 * @param {string} companyId - The company id for the company
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} the licences for the company and the pagination object
 */
async function go(companyId, page = '1') {
  const { results: licences, total: totalNumber } = await _fetch(companyId, page)

  return { licences, totalNumber }
}

async function _fetch(companyId, page) {
  return LicenceModel.query()
    .select(['expiredDate', 'id', 'lapsedDate', 'licenceRef', 'revokedDate', 'startDate'])
    .whereExists(
      LicenceModel.relatedQuery('licenceVersions')
        .innerJoinRelated('licenceVersionHolder')
        .where('licenceVersionHolder.companyId', companyId)
    )
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
      licenceVersionsBuilder
        .select(['endDate', 'id', 'startDate'])
        .whereExists(
          LicenceVersionModel.relatedQuery('licenceVersionHolder').where('licenceVersionHolder.companyId', companyId)
        )
        .orderBy([{ column: 'startDate', order: 'desc' }])
    })
    .orderBy('licenceRef', 'asc')
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
