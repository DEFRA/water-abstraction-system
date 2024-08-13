'use strict'

/**
 * Persists the years flagged on a licence for supplementary billing
 * @module FlagSupplementaryBillingService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')

/**
 * Flags the years on a licence for supplementary billing if the relevant annual two-part tariff bill runs
 * have already been sent. It verifies which years are eligible for supplementary billing based on the
 * bill run status and persists these years for the given licence.
 *
 * @param {module:LicenceModel} licence - The licence where the change has come from
 * @param {Object[]} years - An array of the years a change in the charge version or return affects
 */
async function go (licence, years) {
  const yearsForSupplementaryBilling = await _supplementaryBillingYears(licence.regionId, years)

  if (yearsForSupplementaryBilling.length > 0) {
    await _persistSupplementaryBillingYears(licence.id, yearsForSupplementaryBilling)
  }
}

/**
 * We need to verify which years annual two-part tariff bill runs have been sent. A year shouldn't be flagged for a
 * supplementary bill run if the annual bill run hasn't been sent yet, as any licence changes will be handled in the
 * annual run.
 */
async function _supplementaryBillingYears (regionId, years) {
  const annualTwoPartTariffYears = await BillRunModel.query()
    .distinct('toFinancialYearEnding')
    .where('regionId', regionId)
    .where('batchType', 'two_part_tariff')
    .where('status', 'sent')
    .whereIn('toFinancialYearEnding', years)

  return annualTwoPartTariffYears
}

async function _persistSupplementaryBillingYears (licenceId, yearsForSupplementaryBilling) {
  for (const year of yearsForSupplementaryBilling) {
    await LicenceSupplementaryYearModel.query()
      .insert({
        licenceId,
        financialYearEnd: year.toFinancialYearEnding,
        twoPartTariff: true
      })
  }
}

module.exports = {
  go
}
