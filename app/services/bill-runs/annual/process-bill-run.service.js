'use strict'

/**
 * Process a given annual bill run for the given billing periods
 * @module ProcessBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const BillRunError = require('../../../errors/bill-run.error.js')
const ChargingModuleGenerateBillRunRequest = require('../../../requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const LegacyRefreshBillRunRequest = require('../../../requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')

/**
 * Process a given bill run for the given billing periods
 *
 * In this case, "process" means that we create the required bills and transactions for it in both this service and the
 * Charging Module.
 *
 * We first fetch all the billing accounts applicable to this bill run and their charge information. We pass these to
 * `ProcessBillingPeriodService` which will generate the bill for each billing account both in WRLS and the
 * {@link https://github.com/DEFRA/sroc-charging-module-api | Charging Module API (CHA)}.
 *
 * Once `ProcessBillingPeriodService` is complete we tell the CHA to generate the bill run (this calculates final
 * values for each bill and the bill run overall).
 *
 * The final step is to ping the legacy
 * {@link https://github.com/DEFRA/water-abstraction-service | water-abstraction-service} 'refresh' endpoint. That
 * service will extract the final values from the CHA and update the records on our side finally marking the bill run
 * as **Ready**.
 *
 * @param {module:BillRunModel} billRun - The annual bill run being processed
 * @param {object[]} billingPeriods - An array of billing periods each containing a `startDate` and `endDate`. For
 * annual this will only ever contain a single period
 */
async function go(billRun, billingPeriods) {
  const { id: billRunId, batchType } = billRun
  const billingPeriod = billingPeriods[0]

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    await _processBillingPeriod(billingPeriod, billRun)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, batchType })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    global.GlobalNotifier.omfg('Bill run process errored', { billRun }, error)
  }
}

async function _fetchBillingAccounts(billRun, billingPeriod) {
  try {
    return await FetchBillingAccountsService.go(billRun.regionId, billingPeriod)
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
    await _updateStatus(billRun.id, 'empty')

    return
  }

  // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateBillRunRequest.send(billRun.externalId)

  await LegacyRefreshBillRunRequest.send(billRun.id)
}

async function _processBillingPeriod(billingPeriod, billRun) {
  const billingAccounts = await _fetchBillingAccounts(billRun, billingPeriod)

  const billRunPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, billingAccounts)

  await _finaliseBillRun(billRun, billRunPopulated)
}

async function _updateStatus(billRunId, status) {
  await BillRunModel.query().findById(billRunId).patch({ status })
}

module.exports = {
  go
}
