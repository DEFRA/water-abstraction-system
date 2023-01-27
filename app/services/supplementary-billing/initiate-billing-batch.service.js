'use strict'

/**
 * Handles initiating a new billing batch
 * @module InitiateBillingBatchService
 */

const BillingPeriodService = require('./billing-period.service.js')
const ChargingModuleCreateBillRunService = require('../charging-module/create-bill-run.service.js')
const CheckLiveBillRunService = require('./check-live-bill-run.service.js')
const CreateBillingBatchPresenter = require('../../presenters/supplementary-billing/create-billing-batch.presenter.js')
const CreateBillingBatchService = require('./create-billing-batch.service.js')
const CreateBillingBatchEventService = require('./create-billing-batch-event.service.js')

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
  const { region, scheme, type, user } = billRunRequestData

  // NOTE: It will be required in the future that we cater for a range of billing periods, as changes can be back dated
  // up to 5 years. For now though, our delivery scope is only for the current billing period hence billingPeriods[0]
  const billingPeriod = BillingPeriodService.go()[0]

  await _checkForExistingBillRun(region, billingPeriod)

  const chargingModuleBillRunId = await _createChargingModuleBillRun(region)

  const billingBatch = await CreateBillingBatchService.go(
    region,
    billingPeriod,
    type,
    scheme,
    undefined,
    chargingModuleBillRunId
  )

  await CreateBillingBatchEventService.go(billingBatch, user)

  return _response(billingBatch)
}

async function _checkForExistingBillRun (region, billingPeriod) {
  const financialYear = billingPeriod.endDate.getFullYear()
  const liveBillRunExists = await CheckLiveBillRunService.go(region, financialYear)

  if (liveBillRunExists) {
    throw Error(`Batch already live for region ${region}`)
  }
}

async function _createChargingModuleBillRun (region) {
  const result = await ChargingModuleCreateBillRunService.go(region, 'sroc')

  // A failed response will be due to a failed `RequestLib` request so format an error message accordingly and throw it
  if (!result.succeeded) {
    // We always get the status code and error
    const errorHead = `${result.response.statusCode} ${result.response.error}`

    // We should always get an additional error message but if not then simply throw the status code and error
    if (!result.response.message) {
      throw Error(errorHead)
    }

    throw Error(errorHead + ` - ${result.response.message}`)
  }

  return result.response.id
}

function _response (billingBatch) {
  return CreateBillingBatchPresenter.go(billingBatch)
}

module.exports = {
  go
}
