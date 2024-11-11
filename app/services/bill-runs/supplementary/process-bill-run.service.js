'use strict'

/**
 * Process a given supplementary bill run for the given billing periods
 * @module ProcessBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const BillRunError = require('../../../errors/bill-run.error.js')
const ChargingModuleGenerateBillRunRequest = require('../../../requests/charging-module/generate-bill-run.request.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')
const UnflagUnbilledLicencesService = require('./unflag-unbilled-licences.service.js')

/**
 * Process a given bill run for the given billing periods. In this case, "process" means that we create the
 * required bills and transactions for it in both this service and the Charging Module.
 *
 * @param {module:BillRunModel} billRun
 * @param {object[]} billingPeriods - An array of billing periods each containing a `startDate` and `endDate`
 */
async function go(billRun, billingPeriods) {
  const { id: billRunId } = billRun

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    await _processBillingPeriods(billingPeriods, billRun)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, type: 'supplementary' })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    _logError(billRun, error)
  }
}

async function _processBillingPeriods(billingPeriods, billRun) {
  const accumulatedLicenceIds = []

  // We use `results` to check if any db changes have been made (which is indicated by a billing period being processed
  // and returning `true`).
  const results = []

  for (const billingPeriod of billingPeriods) {
    const { chargeVersions, licenceIdsForPeriod } = await _fetchChargeVersions(billRun, billingPeriod)
    const isPeriodPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions)

    accumulatedLicenceIds.push(...licenceIdsForPeriod)
    results.push(isPeriodPopulated)
  }

  await _finaliseBillRun(billRun, accumulatedLicenceIds, results)
}

async function _fetchChargeVersions(billRun, billingPeriod) {
  try {
    const chargeVersionData = await FetchChargeVersionsService.go(billRun.regionId, billingPeriod)

    // We don't just `return FetchChargeVersionsService.go()` as we need to call HandleErroredBillRunService if it
    // fails
    return chargeVersionData
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToProcessChargeVersions)
  }
}

/**
 * Finalises the bill run by unflagging all unbilled licences, requesting the Charging Module run its generate
 * process, and refreshes the bill run locally. However if there were no resulting bill licences then we simply
 * unflag the unbilled licences and mark the bill run with `empty` status
 *
 * @private
 */
async function _finaliseBillRun(billRun, accumulatedLicenceIds, resultsOfProcessing) {
  // Creating a new set from accumulatedLicenceIds gives us just the unique ids. Objection does not accept sets in
  // .findByIds() so we spread it into an array
  const allLicenceIds = [...new Set(accumulatedLicenceIds)]

  await UnflagUnbilledLicencesService.go(billRun, allLicenceIds)

  // We set `isPopulated` to `true` if at least one processing result was truthy
  const isPopulated = resultsOfProcessing.some((result) => {
    return result
  })

  // If there are no bill licences then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!isPopulated) {
    await _updateStatus(billRun.id, 'empty')

    return
  }

  // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateBillRunRequest.send(billRun.externalId)

  await LegacyRefreshBillRunRequest.send(billRun.id)
}

function _logError(billRun, error) {
  global.GlobalNotifier.omfg('Bill run process errored', { billRun }, error)
}

async function _updateStatus(billRunId, status) {
  await BillRunModel.query().findById(billRunId).patch({ status })
}

module.exports = {
  go
}
