'use strict'

/**
 * Fetches the licences and their versions, related to a company, data needed for the view '/companies/{id}/history'
 * @module FetchHistoryService
 */

const { raw } = require('objection')

const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the licences and their versions, related to a company, data needed for the view '/companies/{id}/history'
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
        .select([
          'endDate',
          'id',
          'startDate',
          raw(
            '(SELECT true FROM public.licence_versions lv2 WHERE lv2.licence_id = licence_versions.licence_id AND lv2.issue = licence_versions.issue AND lv2."increment" = (licence_versions."increment" - 1))'
          ).as('administrative')
        ])
        .whereExists(
          LicenceVersionModel.relatedQuery('licenceVersionHolder').where('licenceVersionHolder.companyId', companyId)
        )
        .orderBy([
          { column: 'startDate', order: 'desc' },
          { column: 'issue', order: 'desc' },
          { column: 'increment', order: 'desc' }
        ])
    })
    .orderBy('licenceRef', 'asc')
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
