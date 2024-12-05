'use strict'

/**
 * Determines which supplementary billing flags should be added to a licence
 * @module DetermineLicenceFlagsService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Flags a licence for supplementary billing, based on the provided scheme
 *
 * The service is passed a licenceId and a charging scheme. Based on this charging scheme the service will then flag
 * the relevant pre sroc or sroc supplementary billing flag. This service is predominantly called from different
 * flagging mechanism in the legacy code. This means if the licence has come through this route we do not need to flag
 * any two-part tariff supplementary billing years.
 *
 * We do not perform any checks on the licence before flagging as this route is being used by users wanting to manually
 * add the flag regardless.
 * This service deals with the following:
 * - A new licence agreement
 * - An ended licence agreement
 * - A deleted licence agreement
 * - Removing a licence from a pre sroc two-part tariff supplementary bill run
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 * @param {string} scheme - The charging scheme that needs to be flagged
 *
 * @returns {object} - An object containing the related licenceId, regionId and licence supplementary billing flags
 */
async function go(licenceId, scheme) {
  const licence = await _fetchLicence(licenceId)

  let flagForSrocSupplementary = licence.includeInSrocBilling
  let flagForPreSrocSupplementary = licence.includeInPresrocBilling === 'yes'

  if (scheme === 'alcs') {
    flagForPreSrocSupplementary = true
  } else {
    flagForSrocSupplementary = true
  }

  const result = {
    licenceId,
    regionId: licence.regionId,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    flagForTwoPartTariffSupplementary: false
  }

  return result
}

async function _fetchLicence(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['regionId', 'includeInSrocBilling', 'includeInPresrocBilling'])
}

module.exports = {
  go
}
