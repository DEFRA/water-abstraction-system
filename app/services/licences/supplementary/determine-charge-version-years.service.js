'use strict'

/**
 * Determines if a licence with a change in charge version should be flagged for supplementary billing
 * @module DetermineChargeVersionYearsService
 */

const ChargeVersionModel = require('../../../models/charge-version.model.js')

/**
 * Determines if a licence with a change in charge version should be flagged for supplementary billing.
 *
 * The service is passed the id of a new charge version and determines if it should be flagged for supplementary
 * billing. This is worked out based on the charge versions scheme and if any related charge reference has a two-part
 * tariff indicator. If they do, then flagForBilling is set to true.
 *
 * @param {string} chargeVersionId - The UUID for the charge version to fetch
 *
 * @returns {object} - An object containing the related licence, charge version start and end date and if the licence
 * should be flagged for two-part tariff supplementary billing
 */
async function go(chargeVersionId) {
  const { chargeReferences, licence, endDate, startDate, scheme } = await _fetchChargeVersion(chargeVersionId)
  const result = {
    licence,
    startDate,
    endDate,
    twoPartTariff: false,
    flagForBilling: false
  }

  if (scheme === 'alcs') {
    return result
  }

  result.twoPartTariff = _twoPartTariffIndicators(chargeReferences)

  // When we can support non two-part tariff billing flags we can remove this line
  result.flagForBilling = result.twoPartTariff

  return result
}

async function _fetchChargeVersion(chargeVersionId) {
  return ChargeVersionModel.query()
    .findById(chargeVersionId)
    .select(['id', 'scheme', 'startDate', 'endDate'])
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder.select(['id', 'adjustments'])
    })
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['id', 'regionId'])
    })
}

function _twoPartTariffIndicators(chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.adjustments?.s127
  })
}

module.exports = {
  go
}
