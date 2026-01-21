'use strict'

/**
 * Fetches the licences, related to a company, data needed for the view 'customers/{id}/licences'
 * @module FetchLicencesService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetches the licences, related to a company, data needed for the view 'customers/{id}/licences'
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
    .select(
      'id',
      'licenceRef',
      'startDate',
      db.raw('LEAST(??, ??, ??) AS ??', ['expiredDate', 'lapsedDate', 'revokedDate', 'endDate'])
    )
    .modify('licenceName')
    .whereExists(
      LicenceModel.relatedQuery('licenceDocument')
        .joinRelated('licenceDocumentRoles')
        .where('licenceDocumentRoles.companyId', companyId)
    )
    .page(page - 1, DatabaseConfig.defaultPageSize)
}
module.exports = {
  go
}
