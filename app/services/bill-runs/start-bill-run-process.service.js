/**
 * Top level service for creating and processing a new bill run
 * @module StartBillRunProcessService
 */

import AnnualProcessBillRunService from './annual/process-bill-run.service.js'
import DetermineBillingPeriodsService from './determine-billing-periods.service.js'
import InitiateBillRunService from './initiate-bill-run.service.js'
import NoBillingPeriodsError from '../../errors/no-billing-periods.error.js'
import SupplementaryProcessBillRunService from './supplementary/process-bill-run.service.js'
import TwoPartTariffProcessBillRunService from './two-part-tariff/process-bill-run.service.js'
import TwoPartTariffSupplementaryProcessBillRunService from './tpt-supplementary/process-bill-run.service.js'

/**
 * Manages the creation of a new bill run
 *
 * @param {string} regionId - Id of the region the bill run is for
 * @param {string} batchType - Type of bill run, for example, supplementary
 * @param {string} userEmail - Email address of the user who initiated the bill run
 * @param {number} financialYearEnding - The financial year end that will be used for the bill run
 *
 * @returns {Promise<object>} Object that will be the JSON response returned to the client
 */
export default async function startBillRunProcessService(regionId, batchType, userEmail, financialYearEnding) {
  const billingPeriods = DetermineBillingPeriodsService(batchType, financialYearEnding)

  if (billingPeriods.length === 0) {
    throw new NoBillingPeriodsError(financialYearEnding)
  }

  const financialYearEndings = _financialYearEndings(billingPeriods)
  const billRun = await InitiateBillRunService(financialYearEndings, regionId, batchType, userEmail)

  _processBillRun(billRun, billingPeriods)
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
      AnnualProcessBillRunService(billRun, billingPeriods)
      break
    case 'supplementary':
      SupplementaryProcessBillRunService(billRun, billingPeriods)
      break
    case 'two_part_tariff':
      TwoPartTariffProcessBillRunService(billRun, billingPeriods)
      break
    case 'two_part_supplementary':
      TwoPartTariffSupplementaryProcessBillRunService(billRun, billingPeriods)
      break
  }
}
