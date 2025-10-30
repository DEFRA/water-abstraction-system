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
  const fullIdentifier = query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
  const partialIdentifier = `%${fullIdentifier}%`

  const select = MonitoringStationModel.query()
    // .select(['id', 'label', 'wiski_id', 'station_reference', 'catchment_name', 'river_name', 'grid_reference'])
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

module.exports = {
  go
}
