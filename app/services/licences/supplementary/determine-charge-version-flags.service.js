'use strict'

/**
 * Determines if a licence with a change in charge version should be flagged for supplementary billing
 * @module DetermineChargeVersionFlagsService
 */

const ChargeVersionModel = require('../../../models/charge-version.model.js')

/**
 * Determines if a licence should be flagged for supplementary billing based on a change in charge version
 *
 * The service determines which flags should be added to the licence based on the chargeVersionId it receives.
 * It uses the charge versions scheme and any associated two-part tariff indicators to decide the appropriate flags for
 * supplementary billing.
 *
 * If the scheme is `alcs`, the licence is flagged for pre-sroc supplementary billing
 * If the scheme is `sroc`:
 * - With no two-part tariff indicators: The licence is flagged for Sroc supplementary billing.
 * - With two-part tariff indicators: The licence is flagged for two-part tariff supplementary billing.
 *
 * NOTE: Unlike pre-sroc and sroc flags (which apply at the licence level), two-part tariff flags are year specific.
 * They are stored in the `LicenceSupplementaryYears` table for each affected year of the charge version
 *
 * @param {string} chargeVersionId - The UUID for the charge version to fetch
 *
 * @returns {object} - An object containing the related licence, charge version start and end date and if the licence
 * should be flagged for two-part tariff supplementary billing
 */
async function go (chargeVersionId) {
  const { chargeReferences, licence, endDate, startDate, scheme } = await _fetchChargeVersion(chargeVersionId)
  const twoPartTariff = _twoPartTariffIndicators(chargeReferences)

  const result = {
    licenceId: licence.id,
    regionId: licence.regionId,
    startDate,
    endDate,
    flagForPreSrocSupplementary: licence.includeInPresrocBilling === 'yes',
    flagForSrocSupplementary: licence.includeInSrocBilling,
    flagForTwoPartTariffSupplementary: twoPartTariff
  }

  if (!result.flagForPreSrocSupplementary && scheme === 'alcs') {
    result.flagForPreSrocSupplementary = true
  }

  if (!result.flagForSrocSupplementary && !twoPartTariff && scheme === 'sroc') {
    result.flagForSrocSupplementary = true
  }

  return result
}

async function _fetchChargeVersion (chargeVersionId) {
  return ChargeVersionModel.query()
    .findById(chargeVersionId)
    .select([
      'id',
      'scheme',
      'startDate',
      'endDate'])
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder.select([
        'id',
        'adjustments'
      ])
    })
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id',
        'regionId',
        'includeInSrocBilling',
        'includeInPresrocBilling'
      ])
    })
}

function _twoPartTariffIndicators (chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.adjustments?.s127
  })
}

module.exports = {
  go
}
