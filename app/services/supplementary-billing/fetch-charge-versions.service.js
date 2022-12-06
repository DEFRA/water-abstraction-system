'use strict'

/**
 * Fetches SROC charge versions that might be included in a supplementary bill run
 * @module FetchChargeVersionsService
 */

const { db } = require('../../../db/db.js')

class FetchChargeVersionsService {
  static async go (regionId, billingPeriod) {
    const chargeVersions = await this._fetch(regionId, billingPeriod)

    return chargeVersions
  }

  static async _fetch (regionId, billingPeriod) {
    const chargeVersions = db
      .select('chv.chargeVersionId', 'chv.scheme', 'chv.endDate', 'lic.licenceId', 'lic.licenceRef')
      .from({ chv: 'water.charge_versions' })
      .innerJoin({ lic: 'water.licences' }, 'chv.licence_id', 'lic.licence_id')
      .where({
        scheme: 'sroc',
        'lic.include_in_supplementary_billing': 'yes',
        'lic.region_id': regionId
      })
      .andWhere('start_date', '>=', billingPeriod.startDate)
      .andWhere('start_date', '<=', billingPeriod.endDate)

    return chargeVersions
  }
}

module.exports = FetchChargeVersionsService
