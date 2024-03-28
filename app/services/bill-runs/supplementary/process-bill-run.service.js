'use strict'

/**
 * Process a given supplementary bill run for the given billing periods
 * @module ProcessBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const BillRunError = require('../../../errors/bill-run.error.js')
const ChargingModuleGenerateBillRunRequest = require('../../../requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')
const UnflagUnbilledLicencesService = require('./unflag-unbilled-licences.service.js')

/**
 * Process a given bill run for the given billing periods
 *
 * In this case, "process" means that we create the required bills and transactions for it in both this service and the
 * Charging Module.
 *
 * For each billing period we need to process we first fetch all the billing accounts applicable to this bill run and their charge information. We pass these to
 * `ProcessBillingPeriodService` which will generate the bill for each billing account both in WRLS and the
 * {@link https://github.com/DEFRA/sroc-charging-module-api | Charging Module API (CHA)}.
 *
 * Once all bill periods are processed we tell the CHA to generate the bill run (this calculates final
 * values for each bill and the bill run overall).
 *
 * The final step is to ping the legacy
 * {@link https://github.com/DEFRA/water-abstraction-service | water-abstraction-service} 'refresh' endpoint. That
 * service will extract the final values from the CHA and update the records on our side finally marking the bill run
 * as **Ready**.
 *
 * @param {module:BillRunModel} billRun - The supplementary bill run being processed
 * @param {Object[]} billingPeriods - An array of billing periods each containing a `startDate` and `endDate`. For
 * annual this will only ever contain a single period
 */
async function go (billRun, billingPeriods) {
  const { id: billRunId } = billRun

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    await _processBillingPeriods(billingPeriods, billRun)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, type: 'supplementary' })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    global.GlobalNotifier.omfg('Bill run process errored', { billRun }, error)
  }
}

async function _fetchBillingAccounts (billRun, billingPeriod) {
  try {
    // We don't just `return FetchBillingDataService.go()` as we need to call HandleErroredBillRunService if it
    // fails
    const billingAccounts = await FetchBillingAccountsService.go(billRun.regionId, billingPeriod)

    const allLicenceIds = []
    for (const billingAccount of billingAccounts) {
      for (const chargeVersion of billingAccount.chargeVersions) {
        allLicenceIds.push(chargeVersion.licence.id)
      }
    }

    return { billingAccounts, licenceIds: [...new Set(allLicenceIds)] }
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToProcessChargeVersions)
  }
}

/**
 * Finalises the bill run by unflagging all unbilled licences, requesting the Charging Module run its generate
 * process, and refreshes the bill run locally. However if there were no resulting bill licences then we simply
 * unflag the unbilled licences and mark the bill run with `empty` status
 */
async function _finaliseBillRun (billRun, accumulatedLicenceIds, resultsOfProcessing) {
  // Creating a new set from accumulatedLicenceIds gives us just the unique ids. Objection does not accept sets in
  // .findByIds() so we spread it into an array
  const allLicenceIds = [...new Set(accumulatedLicenceIds)]

  await UnflagUnbilledLicencesService.go(billRun, allLicenceIds)

  // We set `populated` to `true` if at least one process billing period result was true
  const populated = resultsOfProcessing.some(result => result)

  // If there are no bills then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!populated) {
    await _updateStatus(billRun.id, 'empty')
    return
  }

  // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateBillRunRequest.send(billRun.externalId)

  await LegacyRefreshBillRunRequest.send(billRun.id)
}

async function _processBillingPeriods (billingPeriods, billRun) {
  const accumulatedLicenceIds = []

  // We use `results` to check if any db changes have been made (which is indicated by a billing period being processed
  // and returning `true`).
  const results = []

  for (const billingPeriod of billingPeriods) {
    const { billingAccounts, licenceIds } = await _fetchBillingAccounts(billRun, billingPeriod)
    const billRunIsPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, billingAccounts)

    accumulatedLicenceIds.push(...licenceIds)
    results.push(billRunIsPopulated)
  }

  await _finaliseBillRun(billRun, accumulatedLicenceIds, results)
}

async function _updateStatus (billRunId, status) {
  await BillRunModel.query()
    .findById(billRunId)
    .patch({ status })
}

module.exports = {
  go
}
