'use strict'

/**
 * Handles initiating a new billing batch
 * @module InitiateBillingBatchService
 */

const BillingBatchModel = require('../../../models/water/billing-batch.model.js')
const ChargingModuleCreateBillRunService = require('../../charging-module/create-bill-run.service.js')
const CheckLiveBillRunService = require('./check-live-bill-run.service.js')
const CreateBillingBatchService = require('./create-billing-batch.service.js')
const CreateBillingBatchEventService = require('../create-billing-batch-event.service.js')
const ExpandedError = require('../../../errors/expanded.error.js')

/**
 * Initiate a new billing batch
 *
 * Initiating a new billing batch means creating both the `billing_batch` and `event` record with the appropriate data,
 * along with a bill run record in the SROC Charging Module API.
 *
 * @param {String} regionId Id of the region the bill run is for
 * @param {String} userEmail Email address of the user who initiated the bill run
 *
 * @returns {module:BillingBatchModel} The newly created billing batch instance
 */
async function go (financialYearEndings, regionId, userEmail) {
  const liveBillRunExists = await CheckLiveBillRunService.go(regionId, financialYearEndings.toFinancialYearEnding)

  if (liveBillRunExists) {
    throw new ExpandedError('Batch already live for region', { regionId })
  }

  const chargingModuleResult = await ChargingModuleCreateBillRunService.go(regionId, 'sroc')

  const billingBatchOptions = _billingBatchOptions(chargingModuleResult)
  const billingBatch = await CreateBillingBatchService.go(regionId, financialYearEndings, billingBatchOptions)

  await CreateBillingBatchEventService.go(billingBatch, userEmail)

  return billingBatch
}

function _billingBatchOptions (chargingModuleResult) {
  const options = {
    scheme: 'sroc',
    batchType: 'supplementary'
  }

  if (chargingModuleResult.succeeded) {
    options.externalId = chargingModuleResult.response.body.billRun.id
    options.billRunNumber = chargingModuleResult.response.body.billRun.billRunNumber

    return options
  }

  options.status = 'error'
  options.errorCode = BillingBatchModel.errorCodes.failedToCreateBillRun

  return options
}

module.exports = {
  go
}
