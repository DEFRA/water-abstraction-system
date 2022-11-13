'use strict'

/**
 * @module ChargeVersionHelper
 */

const { db } = require('../../../db/db')

const LicenceHelper = require('./licence.helper.js')

class ChargeVersionHelper {
  static async add (data, licence = {}) {
    const licenceId = await this._addLicence(licence)
    const insertData = this._defaults({ ...data, licence_id: licenceId })

    const result = await db.table('water.charge_versions')
      .insert(insertData)
      .returning('charge_version_id')

    return result
  }

  static async _addLicence (licence) {
    const result = await LicenceHelper.add(licence)

    return result[0].licenceId
  }

  static _defaults (data) {
    const defaults = {
      licence_ref: '01/123',
      scheme: 'sroc'
    }

    return {
      ...defaults,
      ...data
    }
  }
}

module.exports = ChargeVersionHelper
