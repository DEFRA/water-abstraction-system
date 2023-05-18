'use strict'

/**
 * Handles initiating a new billing batch
 * @module InitiateBillingBatchService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const BillingPeriodsService = require('./billing-periods.service.js')
const ChargingModuleCreateBillRunService = require('../charging-module/create-bill-run.service.js')
const CheckLiveBillRunService = require('./check-live-bill-run.service.js')
const CreateBillingBatchPresenter = require('../../presenters/supplementary-billing/create-billing-batch.presenter.js')
const CreateBillingBatchService = require('./create-billing-batch.service.js')
const CreateBillingBatchEventService = require('./create-billing-batch-event.service.js')
const ProcessBillingBatchService = require('./process-billing-batch.service.js')

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
  // up to 5 years. For now though, our delivery scope is only for the 2022-2023 billing period so the final record is
  // extracted from the `billingPeriods` array which will currently always be for the 2022-2023 billing period.
  const billingPeriods = BillingPeriodsService.go()
  // const billingPeriod = billingPeriods[billingPeriods.length - 1]

  const { region, scheme, type, user } = billRunRequestData

  const currentFinancialYear = billingPeriods[0].endDate.getFullYear()
  const liveBillRunExists = await CheckLiveBillRunService.go(region, currentFinancialYear)

  if (liveBillRunExists) {
    throw Error(`Batch already live for region ${region}`)
  }

  const chargingModuleResult = await ChargingModuleCreateBillRunService.go(region, 'sroc')

  const billingBatchOptions = _billingBatchOptions(type, scheme, chargingModuleResult)
  const billingBatch = await CreateBillingBatchService.go(region, billingPeriods, billingBatchOptions)

  await CreateBillingBatchEventService.go(billingBatch, user)

  _processBillingBatch(billingBatch, billingPeriods)

  return _response(billingBatch)
}

function _billingBatchOptions (type, scheme, chargingModuleResult) {
  const options = {
    scheme,
    batchType: type
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

function _processBillingBatch (billingBatch, billingPeriods) {
  billingPeriods.forEach(async (billingPeriod) => {
    await ProcessBillingBatchService.go(billingBatch, billingPeriod)
  })
}

function _response (billingBatch) {
  return CreateBillingBatchPresenter.go(billingBatch)
}

module.exports = {
  go
}
