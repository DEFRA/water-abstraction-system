'use strict'

/**
 * Top level service for creating and processing a new bill run
 * @module StartBillRunProcessService
 */

const AnnualProcessBillRunService = require('./annual/process-bill-run.service.js')
const DetermineBillingPeriodsService = require('./determine-billing-periods.service.js')
const CreateBillRunPresenter = require('../../presenters/bill-runs/create-bill-run.presenter.js')
const InitiateBillRunService = require('./initiate-bill-run.service.js')
const NoBillingPeriodsError = require('../../errors/no-billing-periods.error.js')
const SupplementaryProcessBillRunService = require('./supplementary/process-bill-run.service.js')
const TwoPartTariffProcessBillRunService = require('./two-part-tariff/process-bill-run.service.js')

/**
 * Manages the creation of a new bill run
 *
 * @param {string} regionId - Id of the region the bill run is for
 * @param {string} batchType - Type of bill run, for example, supplementary
 * @param {string} userEmail - Email address of the user who initiated the bill run
 * @param {number} financialYearEnding - End year of the bill run. Only populated for two-part-tariff
 *
 * @returns {Promise<object>} Object that will be the JSON response returned to the client
 */
async function go(regionId, batchType, userEmail, financialYearEnding) {
  const billingPeriods = DetermineBillingPeriodsService.go(batchType, financialYearEnding)

  if (billingPeriods.length === 0) {
    throw new NoBillingPeriodsError(financialYearEnding)
  }

  const financialYearEndings = _financialYearEndings(billingPeriods)
  const billRun = await InitiateBillRunService.go(financialYearEndings, regionId, batchType, userEmail)

  _processBillRun(billRun, billingPeriods)

  return _response(billRun)
}

function _financialYearEndings(billingPeriods) {
  return {
    fromFinancialYearEnding: billingPeriods[billingPeriods.length - 1].endDate.getFullYear(),
    toFinancialYearEnding: billingPeriods[0].endDate.getFullYear()
  }
}

function _processBillRun(billRun, billingPeriods) {
  // We do not `await` the bill run being processed so we can leave it to run in the background while we return an
  // immediate response
  switch (billRun.batchType) {
    case 'annual':
      AnnualProcessBillRunService.go(billRun, billingPeriods)
      break
    case 'supplementary':
      SupplementaryProcessBillRunService.go(billRun, billingPeriods)
      break
    case 'two_part_tariff':
      TwoPartTariffProcessBillRunService.go(billRun, billingPeriods)
      break
  }
}

function _response(billRun) {
  return CreateBillRunPresenter.go(billRun)
}

module.exports = {
  go
}
