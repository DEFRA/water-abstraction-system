'use strict'

/**
 * Creates a billing batch based on the regionId & billing period provided
 * @module CreateBillingBatchService
 */

const BillingBatchModel = require('../../../models/water/billing-batch.model.js')

/**
 * Create a new billing batch
 *
 * @param {Object} regionId The regionId for the selected region
 * @param {Object} financialYearEndings Object that contains the from and to financial year endings
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
async function go (regionId, financialYearEndings, options) {
  const { fromFinancialYearEnding, toFinancialYearEnding } = financialYearEndings
  const optionsData = _defaultOptions(options)

  const billingBatch = await BillingBatchModel.query()
    .insert({
      regionId,
      fromFinancialYearEnding,
      toFinancialYearEnding,
      ...optionsData
    })
    .returning('*')
    .withGraphFetched('region')

  return billingBatch
}

function _defaultOptions (option) {
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
    ...option
  }
}

module.exports = {
  go
}
