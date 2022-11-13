'use strict'

/**
 * @module LicenceHelper
 */

const { db } = require('../../../db/db')

class LicenceHelper {
  static async add (data) {
    const insertData = this._defaults(data)
    const result = await db.table('water.licences')
      .insert(insertData)
      .returning('licence_id')

    return result
  }

  static _defaults (data) {
    const defaults = {
      licence_ref: '01/123'
    }

    return {
      ...defaults,
      ...data
    }
  }
}

module.exports = LicenceHelper
