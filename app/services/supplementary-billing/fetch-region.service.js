'use strict'

/**
 * Fetches a region based on the NALD region ID provided
 * @module FetchRegionService
 */

const { db } = require('../../../db/db.js')

class FetchRegionService {
  /**
   * Returns the `region_id` for the matching record in `water.regions`
   *
   * > This is a temporary service added whilst developing the new SROC supplementary bill run functionality. We expect
   * > the region ID to be provided by the UI as part of the normal workflow
   *
   * @param {string} naldRegionId The NALD region ID (a number between 1 to 9, 9 being the test region) for the region
   * to find
   *
   * @returns {string} The region_id (a GUID) for the matching region
   */
  static async go (naldRegionId) {
    const region = await this._fetch(naldRegionId)

    return region
  }

  static async _fetch (naldRegionId) {
    const result = await db
      .select('region_id')
      .from('water.regions')
      .where({
        nald_region_id: naldRegionId
      })
      .first()

    return result
  }
}

module.exports = FetchRegionService
