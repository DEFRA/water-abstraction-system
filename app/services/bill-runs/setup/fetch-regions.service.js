'use strict'

/**
 * Fetches just the ID and display name for all regions
 * @module FetchRegionsService
 */

const RegionModel = require('../../../models/region.model.js')

/**
 * Fetches just the ID and display name for all regions
 *
 * @returns {Promise<object[]>} The display name and ID for all regions in the service ordered by display name
 */
async function go () {
  return RegionModel.query()
    .select([
      'id',
      'displayName'
    ])
    .orderBy([
      { column: 'displayName', order: 'asc' }
    ])
}

module.exports = {
  go
}
