'use strict'

/**
 * Handles fetching search results for return logs on the /search page
 * @module FetchReturnLogSearchResultsService
 */

const { ref } = require('objection')

const DatabaseConfig = require('../../../config/database.config.js')
const ReturnLogModel = require('../../models/return-log.model.js')

const RETURN_REFERENCE_PATTERN = /^\d+$/

const REGION_ID = 'regions.nald_region_id'
const REQUIRED_FIELDS = [
  'return_logs.id',
  'licence_ref',
  'end_date',
  'status',
  'return_reference',
  REGION_ID,
  'regions.display_name as region_display_name'
]

/**
 * Handles fetching search results for return logs on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page) {
  if (!RETURN_REFERENCE_PATTERN.test(query)) {
    return { results: [], total: 0 }
  }

  return ReturnLogModel.query()
    .select(REQUIRED_FIELDS)
    .join('regions', ref('return_logs.metadata:nald.regionCode').castInt(), REGION_ID)
    .where('returnReference', 'ilike', `%${query}%`)
    .orderBy([
      { column: 'returnReference', order: 'asc' },
      { column: 'endDate', order: 'desc' },
      { column: REGION_ID, order: 'asc' }
    ])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
