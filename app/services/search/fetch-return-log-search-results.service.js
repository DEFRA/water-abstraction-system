'use strict'

/**
 * Handles fetching search results for return logs on the /search page
 * @module FetchReturnLogSearchResultsService
 */

const { ref } = require('objection')

const DatabaseConfig = require('../../../config/database.config.js')
const ReturnLogModel = require('../../models/return-log.model.js')

const RETURN_REFERENCE_PATTERN = /^\d+$/

/**
 * Handles fetching search results for return logs on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {string} page - The requested page
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page) {
  if (!RETURN_REFERENCE_PATTERN.test(query)) {
    return { results: [], total: 0 }
  }

  return ReturnLogModel.query()
    .select(['return_logs.*', 'regions.nald_region_id as region_id', 'regions.display_name as region'])
    .join('regions', ref('return_logs.metadata:nald.regionCode').castInt(), 'regions.nald_region_id')
    .where('returnReference', 'ilike', `%${query}%`)
    .orderBy([
      { column: 'returnReference', order: 'asc' },
      { column: 'endDate', order: 'desc' },
      { column: 'regions.nald_region_id', order: 'asc' }
    ])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
