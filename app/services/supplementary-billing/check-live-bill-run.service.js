'use strict'

/**
 * Checks whether a "live" bill run exists for the specified region, scheme, type and financial year
 * @module CheckLiveBillRunService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')

const LIVE_STATUSES = ['processing', 'ready', 'review']

/**
 * Check whether a "live" bill run exists for the specified region, scheme, type and financial year
 *
 * We define "live" as having the status `processing`, `ready` or `review`
 *
 * @param {*} regionId The id of the region to be checked
 * @param {*} financialYear The financial year to be checked
 *
 * @returns {Boolean} Whether a "live" bill run exists
 */
async function go (regionId, financialYear) {
  const numberOfLiveBillRuns = await BillingBatchModel.query()
    .where({
      regionId,
      toFinancialYearEnding: financialYear,
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
