'use strict'

/**
 * Handles fetching search results for return logs on the /search page
 * @module FetchReturnLogSearchResultsService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../models/return-log.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Handles fetching search results for return logs on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 * @param {boolean} matchFullReturnReference - Whether to perform a full match or just a partial match (the default)
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page, matchFullReturnReference = false) {
  const fullReturnReference = query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
  const partialReturnReference = `%${fullReturnReference}%`

  const select = ReturnLogModel.query()
    .select([
      'return_logs.id',
      'licence_ref',
      'end_date',
      'status',
      'return_reference',
      'regions.nald_region_id',
      'regions.display_name as region_display_name'
    ])
    .join('regions', ref('return_logs.metadata:nald.regionCode').castInt(), 'regions.nald_region_id')
    .orderBy([
      { column: 'returnReference', order: 'asc' },
      { column: 'endDate', order: 'desc' },
      { column: 'regions.nald_region_id', order: 'asc' }
    ])

  if (matchFullReturnReference) {
    return select.where('returnReference', 'ilike', fullReturnReference).page(page - 1, 1000)
  }

  return select
    .whereNot('returnReference', 'ilike', fullReturnReference)
    .where('returnReference', 'ilike', partialReturnReference)
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
