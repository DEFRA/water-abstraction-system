'use strict'

/**
 * Handles fetching search results for licences on the /search page
 * @module FetchLicenceSearchResultsService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')

/**
 * Handles fetching search results for licences on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {string} page - The requested page
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page) {
  return LicenceModel.query()
    .joinRelated('licenceDocumentHeader', { alias: 'doc' })
    .where('licences.licenceRef', 'ilike', `%${query}%`)
    .select(['licences.id', 'licences.licenceRef', 'revokedDate', 'lapsedDate', 'expiredDate', 'doc.metadata'])
    .orderBy([{ column: 'licences.licenceRef', order: 'asc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
