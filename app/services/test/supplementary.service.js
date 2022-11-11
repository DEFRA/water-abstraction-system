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
    const chargeVersions = db
      .select('chargeVersionId', 'licences.licenceRef')
      .from('water.charge_versions')
      .innerJoin('water.licences', 'charge_versions.licence_id', 'licences.licence_id')
      .where({
        scheme: 'sroc',
        end_date: null
      })
      .andWhere({
        'licences.include_in_supplementary_billing': 'yes'
      })

    return chargeVersions
  }
}

module.exports = SupplementaryService
