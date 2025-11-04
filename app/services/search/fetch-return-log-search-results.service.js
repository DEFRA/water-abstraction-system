'use strict'

/**
 * Handles fetching search results for return logs on the /search page
 * @module FetchReturnLogSearchResultsService
 */

const { raw } = require('objection')

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
  const fullReturnReference = _fullReturnReference(query)
  const partialReturnReference = `%${fullReturnReference}%`

  const select = ReturnLogModel.query()
    .select([
      'returnReference',
      'returnLogs.licenceRef',
      'returnLogs.returnRequirementId',
      'licence.id',
      raw('array_agg(return_logs.id)').as('ids'),
      raw('array_agg(due_date)').as('dueDates'),
      raw('array_agg(end_date)').as('endDates'),
      raw('array_agg(status::TEXT)').as('statuses')
    ])
    .joinRelated('licence')
    .groupBy('returnReference', 'returnLogs.licenceRef', 'returnLogs.returnRequirementId', 'licence.id')
    .orderBy([
      { column: 'returnReference', order: 'asc' },
      { column: 'returnLogs.licenceRef', order: 'asc' },
      { column: 'returnLogs.returnRequirementId', order: 'asc' },
      { column: 'licence.id', order: 'asc' }
    ])

  if (matchFullReturnReference) {
    return select.where('returnReference', 'ilike', fullReturnReference).page(page - 1, 1000)
  }

  return select
    .whereNot('returnReference', 'ilike', fullReturnReference)
    .where('returnReference', 'ilike', partialReturnReference)
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

function _fullReturnReference(query) {
  return query
    .replaceAll('\\', '\\\\')
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)
}

module.exports = {
  go
}
