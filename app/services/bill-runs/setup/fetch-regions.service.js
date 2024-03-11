'use strict'

/**
 * Fetches just the ID and display name for all regions
 * @module FetchRegionsService
 */

const RegionModel = require('../../../models/region.model.js')

/**
 * Fetches just the ID and display name for all regions
 *
 * @returns {Object} Instance of `RegionModel` with the matching NALD Region ID
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
