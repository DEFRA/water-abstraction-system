'use strict'

/**
 * Fetches a region based on the NALD region ID provided
 * @module FetchRegionService
 */

const RegionModel = require('../../models/region.model.js')

/**
 * Fetches the region with the matching NALD Region ID
 *
 * This is a temporary service to help us confirm we are selecting the correct data to use when creating a
 * supplementary bill run. Its primary aim is to meet the acceptance criteria defined in WATER-3787.
 *
 * @param {string} naldRegionId - The NALD region ID (a number between 1 to 9, 9 being the test region) for the region
 *  to find
 *
 * @returns {object} Instance of `RegionModel` with the matching NALD Region ID
 */
async function go (naldRegionId) {
  const region = await _fetch(naldRegionId)

  return region
}

async function _fetch (naldRegionId) {
  const result = await RegionModel.query()
    .where('naldRegionId', naldRegionId)
    .first()

  return result
}

module.exports = {
  go
}
