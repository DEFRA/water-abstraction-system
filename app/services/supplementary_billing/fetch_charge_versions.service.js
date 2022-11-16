'use strict'

/**
 * @module FetchChargeVersionsService
 *
 */

const { db } = require('../../../db/db')

class FetchChargeVersionsService {
  static async go (regionId) {
    const chargeVersions = await this._fetch(regionId)

    return chargeVersions
  }

  static async _fetch (regionId) {
    const chargeVersions = db
      .select('chargeVersionId', 'licences.licenceRef')
      .from('water.charge_versions')
      .innerJoin('water.licences', 'charge_versions.licence_id', 'licences.licence_id')
      .where({
        scheme: 'sroc',
        end_date: null
      })
      .andWhere({
        'licences.include_in_supplementary_billing': 'yes',
        'licences.region_id': regionId
      })

    return chargeVersions
  }
}

module.exports = FetchChargeVersionsService
