'use strict'

/**
 * Creates a billing batch based on the regionId & billing period provided
 * @module CreateBillingBatchService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')

/**
 * Create a new billing batch
 *
 * @param {Object} regionId The regionId for the selected region
 * @param {Object} billingPeriod The billing period in the format { startDate: 2022-04-01, endDate: 2023-03-31 }
 * @param {string} [batchType=supplementary] The type of billing batch to create. Defaults to 'supplementary'
 * @param {string} [scheme=sroc] The applicable charging scheme. Defaults to 'sroc'
 * @param {string} [source=wrls] Where the billing batch originated from. Records imported from NALD have the source 'nald'. Those created in the service use 'wrls'. Defaults to 'wrls'
 *
 * @returns {module:BillingBatchModel} The newly created billing batch instance with the `.region` property populated
 */
async function go (regionId, billingPeriod, batchType = 'supplementary', scheme = 'sroc', source = 'wrls') {
  const billingBatch = await BillingBatchModel.query()
    .insert({
      regionId,
      batchType,
      fromFinancialYearEnding: billingPeriod.endDate.getFullYear(),
      toFinancialYearEnding: billingPeriod.endDate.getFullYear(),
      status: 'processing',
      scheme,
      source
    })
    .returning('*')
    .withGraphFetched('region')

  return billingBatch
}

module.exports = {
  go
}
