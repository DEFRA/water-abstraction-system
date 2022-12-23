'use strict'

/**
 * Creates a billing batch based on the regionId & billing period provided
 * @module CreateBillingBatchService
 */

const BillingBatchModel = require('../../models/billing-batch.model.js')

/**
 * Create a new billing batch
 *
 * @param {Object} [regionId] The region_id for the selected region
 * @param {Object} [billingPeriod] The billing period in the format { startDate: 2022-04-01, endDate: 2023-03-31 }
 *
 * @returns {Object} The newly created billing batch record
 */
async function go (regionId, billingPeriod) {
  const billingBatch = await BillingBatchModel.query()
    .insert({
      regionId,
      batchType: 'supplementary',
      fromFinancialYearEnding: billingPeriod.endDate.getFullYear(),
      toFinancialYearEnding: billingPeriod.endDate.getFullYear(),
      status: 'processing',
      scheme: 'sroc'
    })
    .returning('*')

  return billingBatch
}

module.exports = {
  go
}
