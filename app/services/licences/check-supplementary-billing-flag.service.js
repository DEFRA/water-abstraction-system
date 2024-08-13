'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module CheckSupplementaryBillingFlagService
 */

const ChargeVersionModel = require('../../models/charge-version.model.js')
const FlagSupplementaryBillingService = require('./flag-supplementary-billing.service.js')
const SupplementaryBillingYearsService = require('./supplementary-billing-years.service.js')

/**
 * Orchestrates flagging a licence for supplementary billing based on the provided charge version.
 *
 * If a `chargeVersionId` is present in the payload, the service fetches the charge version, along with its relevant
 * charge references and licence details.
 *
 * If the charge version has any two-part tariff indicators on any of its charge references then it calls the
 * `SupplementaryBillingYearsService` where it will work out which financial year ends have been affected by the change
 * in the charge version.
 *
 * If there are years that have been affected, these are then passed to our `FlagSupplementaryBillingService`, which
 * checks if a bill run has already been sent for that affected year, and if it has it will then persist the flag in the
 * `LicenceSupplementaryYear` table.
 *
 * @param {Object} payload - The payload from the request to be validated
 */
async function go (payload) {
  if (!payload.chargeVersionId) {
    return
  }

  const { chargeReferences, licence, endDate, startDate } = await _fetchChargeVersion(payload.chargeVersionId)
  const hasTwoPartTariffIndicator = _hasTwoPartTariffIndicators(chargeReferences)

  if (!hasTwoPartTariffIndicator) {
    return
  }

  const years = await SupplementaryBillingYearsService.go(startDate, endDate)

  if (years) {
    await FlagSupplementaryBillingService.go(licence, years)
  }
}

async function _fetchChargeVersion (chargeVersionId) {
  return ChargeVersionModel.query()
    .findById(chargeVersionId)
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
        'regionId'
      ])
    })
}

function _hasTwoPartTariffIndicators (chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.adjustments?.s127
  })
}

module.exports = {
  go
}
