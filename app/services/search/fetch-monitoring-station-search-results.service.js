'use strict'

/**
 * Handles fetching search results for monitoring stations on the /search page
 * @module FetchMonitoringStationSearchResultsService
 */

const MonitoringStationModel = require('../../models/monitoring-station.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Handles fetching search results for monitoring stations on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 * @param {boolean} matchFullIdentifier - Whether to perform a full match or just a partial match (the default)
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page, matchFullIdentifier = false) {
  const fullIdentifier = _fullIdentifier(query)
  const partialIdentifier = `%${fullIdentifier}%`

  const select = MonitoringStationModel.query()
    .select(['id', 'label', 'catchmentName', 'riverName', 'gridReference'])
    .orderBy([{ column: 'label', order: 'asc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)

  if (matchFullIdentifier) {
    return select.where('label', 'ilike', fullIdentifier).page(page - 1, 1000)
  }

  return select
    .whereNot('label', 'ilike', fullIdentifier)
    .where('label', 'ilike', partialIdentifier)
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

function _fullIdentifier(query) {
  return query
    .replaceAll('\\', '\\\\')
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)
}

module.exports = {
  go
}
