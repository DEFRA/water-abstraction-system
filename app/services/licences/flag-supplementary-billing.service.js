'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module FlagSupplementaryBillingService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const ChargeVersionYearsService = require('./charge-version-years.service.js')
const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')

/**
 * Orchestrates flagging a licence for supplementary billing based on the provided charge version.
 *
 * If a `chargeVersionId` is present in the payload, the service calls `ChargeVersionFlaggingService` with this ID
 * to retrieve the associated licence and affected years.
 *
 * It then identifies years eligible for supplementary billing by filtering out those without an already sent annual
 * two-part tariff bill run.
 *
 * If any years are eligible, each year is persisted in the `LicenceSupplementaryYearModel` table with the
 * corresponding `licenceId`.
 *
 * @param {Object} payload - The payload from the request to be validated
 */
async function go (payload) {
  if (payload.chargeVersionId) {
    const { licence, years } = await ChargeVersionYearsService.go(payload.chargeVersionId)

    if (years) {
      const yearsForSupplementaryBilling = await _getSupplementaryBillingYears(years, licence.regionId)

      if (yearsForSupplementaryBilling.length > 0) {
        await _persistSupplementaryBillingYears(yearsForSupplementaryBilling, licence.id)
      }
    }
  }
}

/**
 * We need to verify which years annual two-part tariff bill runs have been sent. A year shouldn't be flagged for a
 * supplementary bill run if the annual bill run hasn't been sent yet, as any licence changes will be handled in the
 * annual run.
 */
async function _getSupplementaryBillingYears (years, regionId) {
  const annualTwoPartTariffYears = []

  for (const year of years) {
    const annualTwoPartTariff = await BillRunModel.query()
      .where('regionId', regionId)
      .where('batchType', 'two_part_tariff')
      .where('status', 'sent')
      .where('toFinancialYearEnding', year)

    if (annualTwoPartTariff.length > 0) {
      annualTwoPartTariffYears.push(year)
    }
  }

  return annualTwoPartTariffYears
}

async function _persistSupplementaryBillingYears (yearsForSupplementaryBilling, licenceId) {
  for (const year of yearsForSupplementaryBilling) {
    await LicenceSupplementaryYearModel.query()
      .insert({
        licenceId,
        financialYearEnd: year,
        twoPartTariff: true
      })
  }
}

module.exports = {
  go
}
