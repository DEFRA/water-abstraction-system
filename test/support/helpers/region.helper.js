'use strict'

/**
 * @module RegionHelper
 */

const { db } = require('../../../db/db')

class RegionHelper {
  /**
   * Add a region
   *
   * If no `data` is provided, default values will be used. These are
   *
   * - `charge_region_id` - S
   * - `nald_region_id` - 9
   *
   * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
   *
   * @returns {string} The ID of the newly created record
   */
  static async add (data) {
    const insertData = this._defaults(data)
    const result = await db.table('water.regions')
      .insert(insertData)
      .returning('region_id')

    return result
  }

  static _defaults (data) {
    const defaults = {
      charge_region_id: 'S',
      nald_region_id: 9
    }

    return {
      ...defaults,
      ...data
    }
  }
}

module.exports = RegionHelper
