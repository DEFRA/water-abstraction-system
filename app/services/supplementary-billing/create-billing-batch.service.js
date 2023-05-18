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
 * @param {Object} billingPeriods The billing periods in the format [{ startDate: 2022-04-01, endDate: 2023-03-31 }]
 * @param {Object} options Optional params to be overridden
 * @param {String} [options.batchType=supplementary] The type of billing batch to create. Defaults to 'supplementary'
 * @param {String} [options.scheme=sroc] The applicable charging scheme. Defaults to 'sroc'
 * @param {String} [options.source=wrls] Where the billing batch originated from. Records imported from NALD have the
 *  source 'nald'. Those created in the service use 'wrls'. Defaults to 'wrls'
 * @param {String} [options.externalId=null] The id of the bill run as created in the Charging Module
 * @param {String} [options.status=queued] The status that the bill run should be created with
 * @param {Number} [options.errorCode=null] Numeric error code
 *
 * @returns {module:BillingBatchModel} The newly created billing batch instance with the `.region` property populated
 */
async function go (regionId, billingPeriods, options) {
  const optionsData = optionsDefaults(options)

  const billingBatch = await BillingBatchModel.query()
    .insert({
      regionId,
      fromFinancialYearEnding: billingPeriods[billingPeriods.length - 1].endDate.getFullYear(),
      toFinancialYearEnding: billingPeriods[0].endDate.getFullYear(),
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
    status: 'queued',
    errorCode: null
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  go
}
