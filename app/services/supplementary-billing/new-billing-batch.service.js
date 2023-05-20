'use strict'

/**
 * Top level service for creating and processing a new billing batch
 * @module NewBillingBatchService
 */

const BillingPeriodsService = require('./billing-periods.service.js')
const CreateBillingBatchPresenter = require('../../presenters/supplementary-billing/create-billing-batch.presenter.js')
const InitiateBillingBatchService = require('./initiate-billing-batch.service.js')
const ProcessBillingBatchService = require('./process-billing-batch.service.js')

async function go (regionId, userEmail) {
  const billingPeriods = BillingPeriodsService.go()
  const financialYearEndings = _financialYearEndings(billingPeriods)

  const billingBatch = await InitiateBillingBatchService.go(financialYearEndings, regionId, userEmail)

  ProcessBillingBatchService.go(billingBatch, billingPeriods)

  return _response(billingBatch)
}

function _financialYearEndings (billingPeriods) {
  return {
    fromFinancialYearEnding: billingPeriods[billingPeriods.length - 1].endDate.getFullYear(),
    toFinancialYearEnding: billingPeriods[0].endDate.getFullYear()
  }
}

function _response (billingBatch) {
  return CreateBillingBatchPresenter.go(billingBatch)
}

module.exports = {
  go
}
