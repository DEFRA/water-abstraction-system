'use strict'

/**
 * Handles initiating a new billing batch
 * @module InitiateBillingBatchService
 */

const BillingPeriodService = require('./billing-period.service.js')
const CreateBillingBatchPresenter = require('../../presenters/supplementary-billing/create-billing-batch.presenter.js')
const CreateBillingBatchService = require('./create-billing-batch.service.js')
const CreateBillingBatchEventService = require('./create-billing-batch-event.service.js')
// TODO: Investigate why unrelated tests fail if this is required before some other modules
const ChargingModuleCreateBillRunService = require('../charging-module/create-bill-run.service.js')

/**
 * Initiate a new billing batch
 *
 * Initiating a new billing batch means creating both the `billing_batch` and `event` record with the appropriate data.
 * In the future it will also encompass creating the bill run record in the SROC Charging Module API.
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
  const chargingModuleBillRun = await ChargingModuleCreateBillRunService.go(region, 'sroc')
  const billingBatch = await CreateBillingBatchService.go(region, billingPeriod, type, scheme, undefined, chargingModuleBillRun.response.id)

  await CreateBillingBatchEventService.go(billingBatch, user)

  return _response(billingBatch)
}

function _response (billingBatch) {
  return CreateBillingBatchPresenter.go(billingBatch)
}

module.exports = {
  go
}
