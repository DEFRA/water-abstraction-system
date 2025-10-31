'use strict'

/**
 * Handles fetching search results for licences on the /search page
 * @module FetchLicenceSearchResultsService
 */

const LicenceModel = require('../../models/licence.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Handles fetching search results for licences on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 * @param {boolean} matchFullLicenceRef - Whether to perform a full match or just a partial match (the default)
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page, matchFullLicenceRef = false) {
  const fullLicenceRef = query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
  const partialLicenceRef = `%${fullLicenceRef}%`

  const select = LicenceModel.query()
    .joinRelated('licenceDocumentHeader', { alias: 'doc' })
    .select(['licences.id', 'licences.licenceRef', 'revokedDate', 'lapsedDate', 'expiredDate', 'doc.metadata'])
    .orderBy([{ column: 'licences.licenceRef', order: 'asc' }])

  if (matchFullLicenceRef) {
    return select.where('licences.licenceRef', 'ilike', fullLicenceRef).page(page - 1, 1000)
  }

  return select
    .whereNot('licences.licenceRef', 'ilike', fullLicenceRef)
    .where('licences.licenceRef', 'ilike', partialLicenceRef)
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
