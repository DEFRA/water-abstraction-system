'use strict'

const BillingPeriodsService = require('./billing-periods.service.js')
const CreateBillingBatchPresenter = require('../../presenters/supplementary-billing/create-billing-batch.presenter.js')
const InitiateBillingBatchService = require('./initiate-billing-batch.service.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')

async function go (region, user) {
  // NOTE: It will be required in the future that we cater for a range of billing periods, as changes can be back dated
  // up to 5 years. For now though, our delivery scope is only for the 2022-2023 billing period so the final record is
  // extracted from the `billingPeriods` array which will currently always be for the 2022-2023 billing period.
  const billingPeriods = BillingPeriodsService.go()
  const financialYearEndings = _financialYearEndings(billingPeriods)

  const billingBatch = await InitiateBillingBatchService.go(financialYearEndings, region, user)

  _process(billingBatch, billingPeriods)

  return _response(billingBatch)
}

function _financialYearEndings (billingPeriods) {
  return {
    fromFinancialYearEnding: billingPeriods[billingPeriods.length - 1].endDate.getFullYear(),
    toFinancialYearEnding: billingPeriods[0].endDate.getFullYear()
  }
}

async function _process (billingBatch, billingPeriods) {
  const currentBillingPeriod = billingPeriods[billingPeriods.length - 1]

  await ProcessBillingPeriodService.go(billingBatch, currentBillingPeriod)
}

function _response (billingBatch) {
  return CreateBillingBatchPresenter.go(billingBatch)
}

module.exports = {
  go
}
