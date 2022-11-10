'use strict'

/**
 * @module ChargeVersionHelper
 */

const { db } = require('../../../db/db')

class ChargeVersionHelper {
  static async add (data) {
    const result = await db.table('water.charge_versions')
      .insert(data)
      .returning('charge_version_id')

    return result
  }
}

module.exports = ChargeVersionHelper
