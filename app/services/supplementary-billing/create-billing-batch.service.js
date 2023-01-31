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
 * @param {Object} options Optional params to be overridden
 * @param {string} [options.batchType=supplementary] The type of billing batch to create. Defaults to 'supplementary'
 * @param {string} [options.scheme=sroc] The applicable charging scheme. Defaults to 'sroc'
 * @param {string} [options.source=wrls] Where the billing batch originated from. Records imported from NALD have the source 'nald'. Those created in the service use 'wrls'. Defaults to 'wrls'
 * @param {string} [options.externalId=null] The id of the bill run as created in the Charging Module
 * @param {string} [options.status=queued] The status that the bill run should be created with
 *
 * @returns {module:BillingBatchModel} The newly created billing batch instance with the `.region` property populated
 */
async function go (regionId, billingPeriod, options) {
  const optionsData = optionsDefaults(options)

  const billingBatch = await BillingBatchModel.query()
    .insert({
      regionId,
      fromFinancialYearEnding: billingPeriod.endDate.getFullYear(),
      toFinancialYearEnding: billingPeriod.endDate.getFullYear(),
      ...optionsData
    })
    .returning('*')
    .withGraphFetched('region')

  return billingBatch
}

function optionsDefaults (data) {
  const defaults = {
    batchType: 'supplementary',
    scheme: 'sroc',
    source: 'wrls',
    externalId: null,
    status: 'queued'
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  go
}
