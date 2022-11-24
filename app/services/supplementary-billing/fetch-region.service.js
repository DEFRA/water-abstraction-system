'use strict'

/**
 * Fetches a region based on the NALD region ID provided
 * @module FetchRegionService
 */

const RegionModel = require('../../models/region.model.js')

class FetchRegionService {
  /**
   * Fetches the region with the matching NALD Region ID
   *
   * This is a temporary service to help us confirm we are selecting the correct data to use when creating a
   * supplementary bill run. Its primary aim is to meet the acceptance criteria defined in WATER-3787.
   *
   * @param {string} naldRegionId The NALD region ID (a number between 1 to 9, 9 being the test region) for the region
   * to find
   *
   * @returns {Object} Instance of `RegionModel` with the matching NALD Region ID
   */
  static async go (naldRegionId) {
    const region = await this._fetch(naldRegionId)

    return region
  }

  static async _fetch (naldRegionId) {
    const result = await RegionModel.query()
      .where('nald_region_id', naldRegionId)
      .first()

    return result
  }
}

module.exports = FetchRegionService
