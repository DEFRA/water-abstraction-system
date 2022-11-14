'use strict'

/**
 * @module FindRegionService
 */

const { db } = require('../../../db/db')

/**
 * @module FindRegionService
 */

class FindRegionService {
  static async go (regionId) {
    const region = await this._fetchRegion(regionId)

    return region
  }

  static async _fetchRegion (regionId) {
    const result = await db
      .select('region_id')
      .from('water.regions')
      .where({
        nald_region_id: regionId
      })
      .first()

    return result
  }
}

module.exports = FindRegionService
