'use strict'

/**
 * Fetches a region based on the NALD region ID provided
 * @module FetchLicencesService
 */

const LicenceModel = require('../../models/licence.model.js')

class FetchLicencesService {
  /**
   * Returns the `region_id` for the matching record in `water.regions`
   *
   * > This is a temporary service added whilst developing the new SROC supplementary bill run functionality. We expect
   * > the region ID to be provided by the UI as part of the normal workflow
   *
   * @param {string} naldRegionId The NALD region ID (a number between 1 to 9, 9 being the test region) for the region
   * to find
   *
   * @returns {Object[]} Array of matching `LicenceModel`
   */
  static async go (region) {
    const licences = await this._fetch(region)

    return licences
  }

  static async _fetch (region) {
    const result = await LicenceModel.query()
      .where('region_id', region.regionId)
      .where('include_in_supplementary_billing', 'yes')

    return result
  }
}

module.exports = FetchLicencesService
