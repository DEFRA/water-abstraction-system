'use strict'

/**
 * Determines from the years provided which ones have an annual or two-part tariff bill run created
 * @module DetermineExistingBillRunYearsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')

/**
 * Determines from the years provided which ones have an annual or two-part tariff bill run created
 *
 * This service is responsible for determining the years an annual or two part tariff bill run has been created for.
 * This allows those years to be flagged on the licence for supplementary billing.
 *
 * The service has been passed an array of years that the change on the licence covers. It then verify whether an annual
 * or two-part tariff bill run has already been sent for those years. If it has then the year is returned. We do not
 * want to flag any years on the licence that hasn't had a bill run already created, as the change on the licence will
 * get picked up when the annual/ two-part tariff bill run is created for that year.
 *
 * @param {string} regionId - The UUID of the region to search for
 * @param {object[]} years - The years that the licence can be flagged for
 * @param {boolean} twoPartTariff - If there are two-part tariff indicators on the licence
 *
 * @returns {Promise<object[]>} - The years that can be flagged for supplementary billing
 */
async function go(regionId, years, twoPartTariff) {
  return _supplementaryBillingYears(regionId, years, twoPartTariff)
}

/**
 * We need to verify which years annual two-part tariff bill runs have been sent. A year shouldn't be flagged for a
 * supplementary bill run if the annual bill run hasn't been sent yet, as any licence changes will be handled in the
 * annual run.
 *
 * @private
 */
async function _supplementaryBillingYears(regionId, years, twoPartTariff) {
  const batchType = twoPartTariff ? 'two_part_tariff' : 'annual'
  const billRunStatus = ['sent', 'ready', 'review', 'sending']

  const billRuns = await BillRunModel.query()
    .distinct('toFinancialYearEnding')
    .where('regionId', regionId)
    .where('batchType', batchType)
    .whereIn('status', billRunStatus)
    .whereIn('toFinancialYearEnding', years)

  return billRuns.map((billRun) => {
    return billRun.toFinancialYearEnding
  })
}

module.exports = {
  go
}
