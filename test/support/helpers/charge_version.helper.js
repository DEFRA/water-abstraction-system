'use strict'

/**
 * @module ChargeVersionHelper
 */

const { db } = require('../../../db/db')

const LicenceHelper = require('./licence.helper.js')

class ChargeVersionHelper {
  /**
   * Add a new charge version
   *
   * A charge version is always linked to a licence. So, creating a charge version will automatically create a new
   * licence and handle linking the two together by `licence_id`.
   *
   * If no `data` is provided, default values will be used. These are
   *
   * - `scheme` - sroc
   * - `licence_ref` - 01/123
   *
   * See `LicenceHelper` for the licence defaults
   *
   * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
   * @param {Object} [licence] Any licence data you want to use instead of the defaults used here or in the database
   *
   * @returns {string} The ID of the newly created record
   */
  static async add (data = {}, licence = {}) {
    const licenceId = await this._addLicence(licence)
    const insertData = this.defaults({ ...data, licence_id: licenceId })

    const result = await db.table('water.charge_versions')
      .insert(insertData)
      .returning('charge_version_id')

    return result
  }

  /**
   * Returns the defaults used when creating a new charge version
   *
   * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
   * for use in tests to avoid having to duplicate values.
   *
   * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
   */
  static defaults (data = {}) {
    const defaults = {
      licence_ref: '01/123',
      scheme: 'sroc'
    }

    return {
      ...defaults,
      ...data
    }
  }

  static async _addLicence (licence) {
    const result = await LicenceHelper.add(licence)

    return result[0].licenceId
  }
}

module.exports = ChargeVersionHelper
