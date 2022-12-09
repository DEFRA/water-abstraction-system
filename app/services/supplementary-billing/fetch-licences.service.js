'use strict'

/**
 * Fetches a region based on the NALD region ID provided
 * @module FetchLicencesService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches licences flagged for supplementary billing that are linked to the selected region
 *
 * This is a temporary service to help us confirm we are selecting the correct data to use when creating a
 * supplementary bill run. Its primary aim is to meet the acceptance criteria defined in WATER-3787.
 *
 * @param {Object} region Instance of `RegionModel` for the selected region
 *
 * @returns {Object[]} Array of matching `LicenceModel`
 */
async function go (region) {
  const licences = await _fetch(region)

  return licences
}

async function _fetch (region) {
  const result = await LicenceModel.query()
    .innerJoinRelated('chargeVersions')
    .where('region_id', region.regionId)
    .where('include_in_supplementary_billing', 'yes')
    .where('chargeVersions.scheme', 'sroc')

  return result
}

module.exports = {
  go
}
