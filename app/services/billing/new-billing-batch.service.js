'use strict'

/**
 * Top level service for creating and processing a new billing batch
 * @module NewBillingBatchService
 */

const DetermineBillingPeriodsService = require('./determine-billing-periods.service.js')
const CreateBillingBatchPresenter = require('../../presenters/billing/create-billing-batch.presenter.js')
const InitiateBillingBatchService = require('./initiate-billing-batch.service.js')
const SupplementaryProcessBillingBatchService = require('./supplementary/process-billing-batch.service.js')
const TwoPartTariffProcessBillingBatchService = require('./two-part-tariff/process-billing-batch.service.js')

/**
 * Manages the creation of a new billing batch
 *
 * @param {String} regionId Id of the region the bill run is for
 * @param {String} batchType Type of bill run, for example, supplementary
 * @param {String} userEmail Email address of the user who initiated the bill run
 *
 * @returns {Object} Object that will be the JSON response returned to the client
 */
async function go (regionId, batchType, userEmail) {
  const billingPeriods = DetermineBillingPeriodsService.go()
  const financialYearEndings = _financialYearEndings(billingPeriods)

  const billingBatch = await InitiateBillingBatchService.go(financialYearEndings, regionId, batchType, userEmail)

  _processBillingBatch(billingBatch, billingPeriods)

  return _response(billingBatch)
}

function _financialYearEndings (billingPeriods) {
  return {
    fromFinancialYearEnding: billingPeriods[billingPeriods.length - 1].endDate.getFullYear(),
    toFinancialYearEnding: billingPeriods[0].endDate.getFullYear()
  }
}

function _processBillingBatch (billingBatch, billingPeriods) {
  // We do not `await` the billing batch being processed so we can leave it to run in the background while we return an immediate response
  switch (billingBatch.batchType) {
    case 'supplementary':
      SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)
      break
    case 'two_part_tariff':
      TwoPartTariffProcessBillingBatchService.go(billingBatch, billingPeriods)
      break
  }
}

function _response (billingBatch) {
  return CreateBillingBatchPresenter.go(billingBatch)
}

module.exports = {
  go
}
