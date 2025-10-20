'use strict'

/**
 * Handles fetching search results for licences on the /search page
 * @module FetchLicenceSearchResultsService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')

const LICENCE_REF = 'licences.licenceRef'

/**
 * Handles fetching search results for licences on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page) {
  return LicenceModel.query()
    .joinRelated('licenceDocumentHeader', { alias: 'doc' })
    .where(LICENCE_REF, 'ilike', `%${query}%`)
    .select(['licences.id', LICENCE_REF, 'revokedDate', 'lapsedDate', 'expiredDate', 'doc.metadata'])
    .orderBy([{ column: LICENCE_REF, order: 'asc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
