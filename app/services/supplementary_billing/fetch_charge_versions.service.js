'use strict'

/**
 * Fetches SROC charge versions that might be included in a supplementary bill run
 * @module FetchChargeVersionsService
 */

const { db } = require('../../../db/db.js')

class FetchChargeVersionsService {
  static async go (regionId) {
    const chargeVersions = await this._fetch(regionId)

    return chargeVersions
  }

  static async _fetch (regionId) {
    const chargeVersions = db
      .select('chv.chargeVersionId', 'chv.scheme', 'chv.endDate', 'lic.licenceId', 'lic.licenceRef')
      .from({ chv: 'water.charge_versions' })
      .innerJoin({ lic: 'water.licences' }, 'chv.licence_id', 'lic.licence_id')
      .where({
        scheme: 'sroc',
        end_date: null
      })
      .andWhere({
        'lic.include_in_supplementary_billing': 'yes',
        'lic.region_id': regionId
      })

    return chargeVersions
  }
}

module.exports = FetchChargeVersionsService
