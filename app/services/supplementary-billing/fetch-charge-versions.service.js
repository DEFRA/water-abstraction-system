'use strict'

/**
 * Fetches SROC charge versions that might be included in a supplementary bill run
 * @module FetchChargeVersionsService
 */

const { db } = require('../../../db/db.js')

class FetchChargeVersionsService {
  /**
   * Fetch all SROC charge versions linked to licences flagged for supplementary billing that are in the period being
   * billed
   *
   * > This is not the final form of the service. It is a 'work in progress' as we implement tickets that gradually
   * > build up our understanding of SROC supplementary billing
   *
   * @param {string} regionId GUID of the region which the licences will be linked to
   * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
   *
   * @returns an array of Objects containing the relevant charge versions
   */
  static async go (regionId, billingPeriod) {
    const chargeVersions = await this._fetch(regionId, billingPeriod)

    return chargeVersions
  }

  static async _fetch (regionId, billingPeriod) {
    const chargeVersions = db
      .select('chv.chargeVersionId', 'chv.scheme', 'chv.startDate', 'chv.endDate', 'lic.licenceId', 'lic.licenceRef')
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
