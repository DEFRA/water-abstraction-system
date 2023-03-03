'use strict'

/**
 * Handles initiating a new billing batch
 * @module InitiateBillingBatchService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const BillingPeriodService = require('./billing-period.service.js')
const ChargingModuleCreateBillRunService = require('../charging-module/create-bill-run.service.js')
const CheckLiveBillRunService = require('./check-live-bill-run.service.js')
const CreateBillingBatchPresenter = require('../../presenters/supplementary-billing/create-billing-batch.presenter.js')
const CreateBillingBatchService = require('./create-billing-batch.service.js')
const CreateBillingBatchEventService = require('./create-billing-batch-event.service.js')

/**
 * Initiate a new billing batch
 *
 * Initiating a new billing batch means creating both the `billing_batch` and `event` record with the appropriate data,
 * along with a bill run record in the SROC Charging Module API.
 *
 * @param {Object} billRunRequestData Validated version of the data sent in the request to create the new billing batch
 *
 * @returns {Object} Details of the newly created billing batch record
 */
async function go (billRunRequestData) {
  // NOTE: It will be required in the future that we cater for a range of billing periods, as changes can be back dated
  // up to 5 years. For now though, our delivery scope is only for the current billing period hence billingPeriods[0]
  const billingPeriod = BillingPeriodService.go()[0]

  const { region, scheme, type, user } = billRunRequestData

  const financialYear = billingPeriod.endDate.getFullYear()
  const liveBillRunExists = await CheckLiveBillRunService.go(region, financialYear)

  if (liveBillRunExists) {
    throw Error(`Batch already live for region ${region}`)
  }

  const chargingModuleResult = await ChargingModuleCreateBillRunService.go(region, 'sroc')

  const billingBatchOptions = _billingBatchOptions(type, scheme, chargingModuleResult)
  const billingBatch = await CreateBillingBatchService.go(region, billingPeriod, billingBatchOptions)

  await CreateBillingBatchEventService.go(billingBatch, user)

  return _response(billingBatch)
}

function _billingBatchOptions (type, scheme, chargingModuleResult) {
  const options = {
    scheme,
    batchType: type
  }

  if (chargingModuleResult.succeeded) {
    options.externalId = chargingModuleResult.response.body.billRun.id

    return options
  }

  options.status = 'error'
  options.errorCode = BillingBatchModel.errorCodes.failedToCreateBillRun

  return options
}

function _response (billingBatch) {
  return CreateBillingBatchPresenter.go(billingBatch)
}

module.exports = {
  go
}
