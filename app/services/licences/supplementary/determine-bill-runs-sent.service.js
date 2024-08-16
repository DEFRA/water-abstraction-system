'use strict'

/**
 * Determines from the years provided which ones have an annual two-part tariff bill run sent
 * @module DetermineBillRunsSentService
 */

const BillRunModel = require('../../../models/bill-run.model.js')

/**
 * Determines from the years provided which ones have an annual two-part tariff bill run sent
 *
 * This service is responsible for determining the years an annual two part tariff bill run has been sent for. This
 * allows those years to be flagged on the licence for supplementary billing.
 *
 * The service has been passed an array of years that the change on the licence covers. It then verify whether an annual
 * two-part tariff bill run has already been sent for those years. If it has then the year is returned. We do not want
 * to flag any years on the licence that hasn't had a bill run already sent, as the change on the licence will get
 * picked up on the annual bill run.
 *
 * @param {String} regionId - The UUID of the region to search for
 * @param {Object[]} years - An array of years that the licence can be flagged for
 *
 * @returns {Object[]} - An array of years that can be flagged for supplementary billing
 */
async function go (regionId, years) {
  return _supplementaryBillingYears(regionId, years)
}

/**
 * We need to verify which years annual two-part tariff bill runs have been sent. A year shouldn't be flagged for a
 * supplementary bill run if the annual bill run hasn't been sent yet, as any licence changes will be handled in the
 * annual run.
 */
async function _supplementaryBillingYears (regionId, years) {
  const billRuns = await BillRunModel.query()
    .distinct('toFinancialYearEnding')
    .where('regionId', regionId)
    .where('batchType', 'two_part_tariff')
    .where('status', 'sent')
    .whereIn('toFinancialYearEnding', years)

  return billRuns.map((billRun) => {
    return billRun.toFinancialYearEnding
  })
}

module.exports = {
  go
}
