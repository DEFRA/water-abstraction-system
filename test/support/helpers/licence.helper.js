'use strict'

/**
 * @module LicenceHelper
 */

const { db } = require('../../../db/db')

class LicenceHelper {
  /**
   * Add a new licence
   *
   * If no `data` is provided, default values will be used. These are
   *
   * - `licence_ref` - 01/123
   *
   * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
   *
   * @returns {string} The ID of the newly created record
   */
  static async add (data = {}) {
    const insertData = this.defaults(data)
    const result = await db.table('water.licences')
      .insert(insertData)
      .returning('licence_id')

    return result
  }

  static defaults (data = {}) {
    const defaults = {
      licence_ref: '01/123',
      region_id: 'bd114474-790f-4470-8ba4-7b0cc9c225d7'
    }

    return {
      ...defaults,
      ...data
    }
  }
}

module.exports = LicenceHelper
