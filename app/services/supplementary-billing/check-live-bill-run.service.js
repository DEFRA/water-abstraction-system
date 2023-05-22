'use strict'

/**
 * Checks whether a "live" bill run exists for the specified region, scheme, type and financial year
 * @module CheckLiveBillRunService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')

const LIVE_STATUSES = ['processing', 'ready', 'review', 'queued']

/**
 * Check whether a "live" bill run exists for the specified region, scheme, type and financial year
 *
 * We define "live" as having the status `processing`, `ready`, `review` or `queued`
 *
 * @param {String} regionId The id of the region to be checked
 * @param {Number} toFinancialYearEnding The financial year to be checked
 *
 * @returns {Boolean} Whether a "live" bill run exists
 */
async function go (regionId, toFinancialYearEnding) {
  const numberOfLiveBillRuns = await BillingBatchModel.query()
    .select(1)
    .where({
      regionId,
      toFinancialYearEnding,
      scheme: 'sroc',
      batchType: 'supplementary'
    })
    .whereIn('status', LIVE_STATUSES)
    .resultSize()

  return numberOfLiveBillRuns !== 0
}

module.exports = {
  go
}
