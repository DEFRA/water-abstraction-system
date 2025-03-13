'use strict'

/**
 * Generates a supplementary two-part tariff bill run
 * @module GenerateBillRunService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const ChargingModuleGenerateBillRunRequest = require('../../../requests/charging-module/generate-bill-run.request.js')
const {
  calculateAndLogTimeTaken,
  currentTimeInNanoseconds,
  timestampForPostgres
} = require('../../../lib/general.lib.js')
const FetchTwoPartTariffBillingAccountsService = require('../fetch-two-part-tariff-billing-accounts.service.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')
const UnflagUnbilledSupplementaryLicencesService = require('../unflag-unbilled-supplementary-licences.service.js')

/**
 * Generates a supplementary two-part tariff bill run
 *
 * In this case, "generate" means that we create the required bills and transactions for them in both this service and
 * the Charging Module.
 *
 * > In the other bill run types this would be the `ProcessBillRunService` but that has already been used to handle the
 * > match and allocate process in two-part tariff
 *
 * We first fetch all the billing accounts applicable to this bill run and their charge information. We pass these to
 * `ProcessBillingPeriodService` which will generate the bill for each billing account both in WRLS and the
 * {@link https://github.com/DEFRA/sroc-charging-module-api | Charging Module API (CHA)}.
 *
 * Once `ProcessBillingPeriodService` is complete we tell the CHA to generate the bill run (this calculates final values
 * for each bill and the bill run overall).
 *
 * The final step is to ping the legacy
 * {@link https://github.com/DEFRA/water-abstraction-service | water-abstraction-service} 'refresh' endpoint. That
 * service will extract the final values from the CHA and update the records on our side, finally marking the bill run
 * as **Ready**.
 *
 * @param {module:BillRunModel} billRun - The instance of the supplementary two-part tariff bill run that has been
 * reviewed and is ready for generating
 */
async function go(billRun) {
  const { id: billRunId } = billRun

  try {
    const startTime = currentTimeInNanoseconds()

    const billingPeriod = _billingPeriod(billRun)

    await _processBillingPeriod(billingPeriod, billRun)

    calculateAndLogTimeTaken(startTime, 'Generate supplementary two-part tariff bill run complete', { billRunId })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    global.GlobalNotifier.omfg('Generate supplementary two-part tariff bill run failed', { billRun }, error)
  }
}

/**
 * Unlike other bill runs where the bill run itself and the bills are generated in one process, two-part tariff is
 * split. The first part which matches and allocates charge information to returns create's the bill run itself. This
 * service handles the second part where we create the bills using the match and allocate data.
 *
 * This means we've already determined the billing period and recorded it against the bill run. So, we retrieve it from
 * the bill run rather than pass it into the service.
 *
 * @private
 */
function _billingPeriod(billRun) {
  const { toFinancialYearEnding } = billRun

  return {
    startDate: new Date(`${toFinancialYearEnding - 1}-04-01`),
    endDate: new Date(`${toFinancialYearEnding}-03-31`)
  }
}

async function _fetchBillingAccounts(billRunId) {
  try {
    return await FetchTwoPartTariffBillingAccountsService.go(billRunId)
  } catch (error) {
    // We know we're saying we failed to process charge versions. But we're stuck with the legacy error codes and this
    // is the closest one related to what stage we're at in the process
    throw new BillRunError(error, BillRunModel.errorCodes.failedToProcessChargeVersions)
  }
}

async function _finaliseBillRun(billRun, billRunPopulated) {
  // If there are no bill licences then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!billRunPopulated) {
    await BillRunModel.query().findById(billRun.id).patch({ status: 'empty', updatedAt: timestampForPostgres() })
  } else {
    // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
    // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
    await ChargingModuleGenerateBillRunRequest.send(billRun.externalId)

    // TODO: The legacy service still handles refreshing the billing information on our side after the Charging Module API
    // has finished generating the bill run. We need to take this over when we next get the opportunity.
    await LegacyRefreshBillRunRequest.send(billRun.id)
  }

  // We unflag any unbilled licences last, just in case any of the other calls error. Should that happen, the bill run
  // will be flagged as errored and the unassigned from the licences. They can then be processed again. If we get to
  // here though, we're removing the licence supplementary year record, because we are saying the licence has been
  // processed and no new bill was needed.
  await UnflagUnbilledSupplementaryLicencesService.go(billRun)
}

async function _processBillingPeriod(billingPeriod, billRun) {
  const { id: billRunId } = billRun

  const billingAccounts = await _fetchBillingAccounts(billRunId)

  const billRunPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, billingAccounts)

  await _finaliseBillRun(billRun, billRunPopulated)
}

module.exports = {
  go
}
