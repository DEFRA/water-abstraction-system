'use strict'

/**
 * @module SupplementaryService
 */

const { db } = require('../../../db/db')

/**
 * Returns charge versions selected for supplementary billing
 * At present this returns a set response until further development
*/

// Format into the response and return the data
class SupplementaryService {
  static async go () {
    const chargeVersions = await this._fetchChargeVersions()
    const response = {
      chargeVersions
    }

    return response
  }

  static async _fetchChargeVersions () {
    const chargeVersions = db.table('water.charge_versions')
      .where('scheme', 'sroc')
      .select('chargeVersionId')
      .select('licenceRef')

    return chargeVersions
  }
}

module.exports = SupplementaryService
