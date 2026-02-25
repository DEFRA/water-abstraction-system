'use strict'

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 * @module FetchLicencesService
 */

const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')

const databaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 *
 * @param {string} companyId - The company id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the licences for the company and the pagination object
 */
async function go(companyId, page) {
  const { results, total } = await _fetch(companyId, page)

  return { licences: results, pagination: { total } }
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
    .page(page - 1, databaseConfig.defaultPageSize)
}
module.exports = {
  go
}
