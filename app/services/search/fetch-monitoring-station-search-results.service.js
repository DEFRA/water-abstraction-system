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
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page) {
  const likeQuery = `%${query}%`

  return MonitoringStationModel.query()
    .select(['id', 'label', 'wiski_id', 'station_reference', 'catchment_name', 'river_name'])
    .where('station_reference', 'ilike', likeQuery)
    .orWhere('wiski_id', 'ilike', likeQuery)
    .orWhere('label', 'ilike', likeQuery)
    .orderBy([{ column: 'label', order: 'asc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
